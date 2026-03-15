-- Run this in Supabase SQL Editor

-- Teachers table (handled by Supabase Auth automatically)
-- We just add a profiles table for extra info

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  school text,
  plan text default 'free',
  tests_this_month integer default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tests table
create table if not exists tests (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references auth.users on delete cascade not null,
  title text not null,
  subject text,
  class_name text,
  status text default 'draft',
  share_code text unique,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Questions table
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  test_id uuid references tests on delete cascade not null,
  question_text text not null,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text,
  question_type text default 'mcq',
  order_num integer,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Student attempts table
create table if not exists attempts (
  id uuid default gen_random_uuid() primary key,
  test_id uuid references tests on delete cascade not null,
  student_name text not null,
  student_email text,
  answers jsonb,
  score integer,
  total integer,
  submitted_at timestamp with time zone default timezone('utc', now())
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table tests enable row level security;
alter table questions enable row level security;
alter table attempts enable row level security;

-- Policies: teachers can only see their own data
create policy "Teachers see own profile" on profiles for all using (auth.uid() = id);
create policy "Teachers manage own tests" on tests for all using (auth.uid() = teacher_id);
create policy "Teachers manage own questions" on questions for all using (
  test_id in (select id from tests where teacher_id = auth.uid())
);
create policy "Anyone can submit attempt" on attempts for insert with check (true);
create policy "Teachers see own attempts" on attempts for select using (
  test_id in (select id from tests where teacher_id = auth.uid())
);

-- Auto create profile when teacher signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
