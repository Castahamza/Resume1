-- Monthly AI generation counters for free tier

alter table public.profiles
  add column if not exists ai_generations_month text,
  add column if not exists ai_generations_count int not null default 0;
