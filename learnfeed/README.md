# LearnFeed

Learn in public, social-media style. Instead of browsing a site full of courses, you build your own
learning source: one post per thing you learned, grouped into **series** (e.g. *100 Days of SQL*),
readable as a **thread** (the story, day by day) or scannable as a **grid** (Instagram-style).

This is a standalone app living next to LearnVault in this repo. Same stack (React + Vite + Supabase)
and the same paper-and-ink design tokens.

## Features

- **Posts:** markdown body with preview, up to 4 images, source links, and tags. Each post is public or private ("only me").
- **Series:** an album or thread with an optional goal (e.g. 100 days).
  - Progress bar and a daily-posting streak.
  - **Grid view** shows one cell per day, with filled days linking to their post and the next day as a "+" shortcut.
  - **Thread view** shows every post in order along a timeline.
- **Feed ⇄ Grid toggle** on Home, Explore, profiles, and tag pages. The choice is remembered per browser.
- **Social:** public profiles (`/u/:username`), follow/unfollow, a Home feed of people you follow, likes, and tag pages (`/t/:tag`).
- Posts have prev/next navigation within their series (← Day 22 · Day 24 →).

## Setup

1. **Create a Supabase project**, or reuse LearnVault's: every table name here is new.
2. Open **SQL → New query**, paste [`schema.sql`](./schema.sql), and run it. This creates:
   - the tables
   - row-level security
   - the public `post-images` storage bucket and its policies
3. *(Recommended for quick testing)* Turn off "Confirm email" under **Authentication → Providers → Email**.
4. Configure env and run:
   ```bash
   cd learnfeed
   cp .env.example .env.local   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   npm install
   npm run dev
   ```
5. *(Optional)* Sign up and pick a username. Then edit the username in [`seed.sql`](./seed.sql) and run it to get a demo series with 10 days filled in.

When you deploy it as a single-page app (Netlify, Vercel, etc.), add a rewrite from `/*` to `/index.html` so deep links like `/s/<id>` work.

## Manual test checklist

1. Sign up, then pick a username. You are sent to the composer.
2. In the composer, use **+ New series**: "100 Days of X" with a goal of 100.
3. Post Day 1 with an image, a link, and a couple of tags.
4. Open the series page. It should show **1 / 100 days**, the grid should show Day 1 filled and Day 2 as "+", and Thread view should show the post.
5. In a second browser or incognito window, sign up a second account. Follow the first user and check their post shows on Home. Like it and check the count updates.
6. Make the post private. Check it disappears for the second account and when logged out.

## Structure

```
src/
  lib/         supabase client · api.js (every query) · storage.js (image upload) · utils.js
  hooks/       useAuth (session + profile) · useViewMode (feed/grid) · usePagedPosts
  components/  PostCard · PostGridTile · PostList · SeriesGrid · SeriesThread · Composer/* …
  pages/       Home · Explore · Profile · Series · Post · Tag · Compose · Settings · Login
```

## Ideas for next

- Comments.
- "Join this challenge": copy someone's series template and track your own progress against it.
- Turn a post's key points into flashcards (reusing LearnVault's Flashcards).
- Reminders when your streak is about to break.
