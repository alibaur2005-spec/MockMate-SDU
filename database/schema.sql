-- MockMate Database Schema
-- Run these queries in your Supabase SQL Editor
-- This script is idempotent: it will drop existing policies/triggers before recreating them.

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies (Drop first to avoid "already exists" error)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- 2. INTERVIEWS TABLE
-- ============================================
create table if not exists public.interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  questions jsonb not null,
  answers jsonb,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  duration_seconds integer,
  started_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.interviews enable row level security;

drop policy if exists "Users can view own interviews" on public.interviews;
create policy "Users can view own interviews" on public.interviews
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own interviews" on public.interviews;
create policy "Users can insert own interviews" on public.interviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own interviews" on public.interviews;
create policy "Users can update own interviews" on public.interviews
  for update using (auth.uid() = user_id);

-- ============================================
-- 3. TRANSCRIPTIONS TABLE
-- ============================================
create table if not exists public.transcriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_url text,
  transcription_text text,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

alter table public.transcriptions enable row level security;

drop policy if exists "Users can view own transcriptions" on public.transcriptions;
create policy "Users can view own transcriptions" on public.transcriptions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own transcriptions" on public.transcriptions;
create policy "Users can insert own transcriptions" on public.transcriptions
  for insert with check (auth.uid() = user_id);

-- ============================================
-- 4. AI REVIEWS TABLE
-- ============================================
create table if not exists public.ai_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  interview_id uuid references public.interviews on delete cascade,
  review_text text not null,
  score integer check (score >= 0 and score <= 100),
  strengths jsonb,
  weaknesses jsonb,
  suggestions jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.ai_reviews enable row level security;

drop policy if exists "Users can view own reviews" on public.ai_reviews;
create policy "Users can view own reviews" on public.ai_reviews
  for select using (auth.uid() = user_id);

-- ============================================
-- 5. TRIGGER TO AUTO-CREATE PROFILE
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing; -- Handle potential conflict
  return new;
end;
$$;

-- Drop trigger first to handle replacement
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- 6. COMPANIES TABLE
-- ============================================
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.companies enable row level security;

drop policy if exists "Enable read access for all users" on public.companies;
create policy "Enable read access for all users" on public.companies
  for select using (true);

drop policy if exists "Enable insert for authenticated users only" on public.companies;
create policy "Enable insert for authenticated users only" on public.companies
    for insert with check (auth.role() = 'authenticated');


-- ============================================
-- 7. QUESTIONS TABLE
-- ============================================
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies on delete cascade,
  content text not null,
  topic text,
  difficulty text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.questions enable row level security;

drop policy if exists "Enable read access for all users" on public.questions;
create policy "Enable read access for all users" on public.questions
  for select using (true);

drop policy if exists "Enable insert for authenticated users only" on public.questions;
create policy "Enable insert for authenticated users only" on public.questions
    for insert with check (auth.role() = 'authenticated');

-- ============================================
-- 8. INTERVIEW ATTEMPTS TABLE
-- ============================================
create table if not exists public.interview_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company_id uuid references public.companies on delete set null,
  question_id uuid references public.questions on delete set null,
  answer text,
  status text not null default 'in_progress',
  started_at timestamp with time zone default timezone('utc'::text, now()),
  ended_at timestamp with time zone
);

alter table public.interview_attempts enable row level security;

drop policy if exists "Users can view own attempts" on public.interview_attempts;
create policy "Users can view own attempts" on public.interview_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own attempts" on public.interview_attempts;
create policy "Users can insert own attempts" on public.interview_attempts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own attempts" on public.interview_attempts;
create policy "Users can update own attempts" on public.interview_attempts
  for update using (auth.uid() = user_id);

-- ============================================
-- 9. EVALUATIONS TABLE
-- ============================================
create table if not exists public.evaluations (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references public.interview_attempts on delete cascade,
  score integer,
  feedback jsonb,
  ai_model text,
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.evaluations enable row level security;

drop policy if exists "Users can view own evaluations via attempts" on public.evaluations;
create policy "Users can view own evaluations via attempts" on public.evaluations
  for select using (
    exists (
      select 1 from public.interview_attempts
      where public.interview_attempts.id = public.evaluations.attempt_id
      and public.interview_attempts.user_id = auth.uid()
    )
  );
  
drop policy if exists "Users can insert own evaluations via attempts" on public.evaluations;
create policy "Users can insert own evaluations via attempts" on public.evaluations
  for insert with check (
      exists (
      select 1 from public.interview_attempts
      where public.interview_attempts.id = public.evaluations.attempt_id
      and public.interview_attempts.user_id = auth.uid()
    )
  );

-- ============================================
-- 10. ADMISSION PREDICTIONS TABLE
-- ============================================
create table if not exists public.admission_predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  company_id uuid references public.companies on delete cascade,
  probability float,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.admission_predictions enable row level security;

drop policy if exists "Users can view own predictions" on public.admission_predictions;
create policy "Users can view own predictions" on public.admission_predictions
  for select using (auth.uid() = user_id);
