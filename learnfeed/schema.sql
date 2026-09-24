-- LearnFeed schema. Run this in the Supabase SQL editor (SQL > New query).
-- Safe to run in the same project as LearnVault: every name here is new.

-- ── Profiles ───────────────────────────────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null default '',
  bio          text not null default '',
  avatar_url   text not null default '',
  created_at   timestamptz not null default now()
);

-- ── Series (an album / thread, e.g. "100 Days of SQL") ─────────────────────
create table series (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  title       text not null check (length(title) between 1 and 120),
  description text not null default '',
  cover_url   text not null default '',
  goal_days   int check (goal_days is null or goal_days between 1 and 1000),
  start_date  date not null default current_date,
  visibility  text not null default 'public' check (visibility in ('public', 'private')),
  created_at  timestamptz not null default now(),
  constraint series_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade
);

-- ── Posts ──────────────────────────────────────────────────────────────────
create table posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  series_id   uuid,
  day_number  int check (day_number is null or day_number >= 1),
  title       text not null check (length(title) between 1 and 200),
  body        text not null default '',
  images      text[] not null default '{}',
  links       jsonb not null default '[]',   -- [{ "url": "...", "label": "..." }]
  tags        text[] not null default '{}',
  visibility  text not null default 'public' check (visibility in ('public', 'private')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint posts_user_id_fkey   foreign key (user_id)   references profiles(id) on delete cascade,
  constraint posts_series_id_fkey foreign key (series_id) references series(id)   on delete set null
);

create index posts_user_created_idx   on posts (user_id, created_at desc);
create index posts_series_day_idx     on posts (series_id, day_number);
create index posts_public_created_idx on posts (created_at desc) where visibility = 'public';
create index posts_tags_idx           on posts using gin (tags);

create function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger posts_updated_at before update on posts
  for each row execute function set_updated_at();

-- ── Follows & likes ────────────────────────────────────────────────────────
create table follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index follows_following_idx on follows (following_id);

create table likes (
  user_id    uuid not null references profiles(id) on delete cascade,
  post_id    uuid not null references posts(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index likes_post_idx on likes (post_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table series   enable row level security;
alter table posts    enable row level security;
alter table follows  enable row level security;
alter table likes    enable row level security;

-- Profiles: everyone can read, you can only write your own.
create policy "profiles: public read" on profiles for select using (true);
create policy "profiles: own insert"  on profiles for insert with check (auth.uid() = id);
create policy "profiles: own update"  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Series & posts: public rows readable by anyone (even logged out), private only by owner.
create policy "series: read" on series for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "series: own write" on series for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "posts: read" on posts for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "posts: own write" on posts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Follows & likes: readable by everyone (for counts), writable only by the actor.
create policy "follows: public read" on follows for select using (true);
create policy "follows: own insert"  on follows for insert with check (auth.uid() = follower_id);
create policy "follows: own delete"  on follows for delete using (auth.uid() = follower_id);

create policy "likes: read" on likes for select
  using (exists (select 1 from posts p where p.id = post_id));  -- only likes on posts you can see
create policy "likes: own insert" on likes for insert with check (
  auth.uid() = user_id and exists (select 1 from posts p where p.id = post_id)
);
create policy "likes: own delete" on likes for delete using (auth.uid() = user_id);

-- ── Storage: public bucket for post images, one folder per user ────────────
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post-images: own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "post-images: own update" on storage.objects for update to authenticated
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "post-images: own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
