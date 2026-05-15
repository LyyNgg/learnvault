-- Run this in the Supabase SQL editor (SQL > New query)

-- Entries (Answer Bank)
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question text not null default '',
  answer text not null default '',
  tag text not null default '',
  confidence text not null default 'ok' check (confidence in ('weak', 'ok', 'strong')),
  review_count int not null default 0,
  next_review timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Applications (Session Log)
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null default '',
  role text not null default '',
  applied date,
  overall text not null default 'active' check (overall in ('active', 'pass', 'fail', 'pending')),
  created_at timestamptz not null default now()
);

-- Rounds (Session Log)
create table rounds (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  num int not null default 1,
  type text not null default '',
  date date,
  interviewer text not null default '',
  interviewer_role text not null default '',
  outcome text not null default 'pending' check (outcome in ('pass', 'fail', 'pending')),
  went_wrong text not null default '',
  lessons text not null default '',
  tags jsonb not null default '[]',
  questions_asked jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Row Level Security — users can only see and modify their own data
alter table entries enable row level security;
alter table applications enable row level security;
alter table rounds enable row level security;

create policy "entries: own rows only"
  on entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "applications: own rows only"
  on applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "rounds: own rows only"
  on rounds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
