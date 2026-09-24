-- Optional demo data: a "100 Days of SQL" series with 10 days already posted.
-- 1) Sign up in the app and pick a username first.
-- 2) Replace 'your_username' below, then run this in the Supabase SQL editor.
do $$
declare
  uid uuid;
  sid uuid;
  topics text[] := array['SELECT & FROM','WHERE filters','ORDER BY','LIMIT & OFFSET','DISTINCT',
                         'COUNT, SUM, AVG','GROUP BY','HAVING vs WHERE','INNER JOIN','LEFT JOIN'];
begin
  select id into uid from profiles where username = 'your_username';
  if uid is null then raise exception 'No profile with that username — sign up in the app first.'; end if;

  insert into series (user_id, title, description, goal_days, start_date)
  values (uid, '100 Days of SQL', 'From SELECT to window functions, one concept a day.', 100, current_date - 9)
  returning id into sid;

  for i in 1..array_length(topics, 1) loop
    insert into posts (user_id, series_id, day_number, title, body, links, tags, created_at)
    values (
      uid, sid, i,
      'Day ' || i || ': ' || topics[i],
      E'Today I learned **' || topics[i] || E'**.\n\n## Key idea\n- …\n\n```sql\nSELECT …\n```',
      '[{"url": "https://www.postgresql.org/docs/current/", "label": "Postgres docs"}]',
      array['sql', '100daysofsql'],
      now() - make_interval(days => 10 - i)
    );
  end loop;
end $$;
