-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- Users Table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  is_admin boolean default false,
  credits integer default 1000, -- 1000 free credits for new users
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to create a user entry when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, is_admin, credits)
  values (new.id, new.email, false, 1000);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Subscriptions Table
create type subscription_status as enum ('active', 'canceled', 'expired', 'past_due');
create type subscription_plan as enum ('weekly', 'monthly', 'yearly');

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan_type subscription_plan not null,
  status subscription_status default 'active',
  current_period_end timestamp with time zone not null,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Credit Transactions Table
create type transaction_type as enum ('addition', 'deduction');

create table public.credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  amount integer not null,
  type transaction_type not null,
  reference text, -- e.g., 'start_application', 'mark_applied', 'subscription_rollover'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments Table
create type payment_status as enum ('pending', 'completed', 'failed');

create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  amount integer not null,
  currency text default 'INR' not null,
  status payment_status default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  promo_code_id uuid, -- Reference to used promo code if any
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Promo Codes Table
create table public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_percent integer not null check (discount_percent >= 0 and discount_percent <= 100),
  is_active boolean default true,
  is_used boolean default false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Promo Code Usage Table
create table public.promo_code_usage (
  id uuid default gen_random_uuid() primary key,
  promo_id uuid references public.promo_codes(id) on delete cascade not null unique, -- Globally single use
  user_id uuid references public.users(id) on delete cascade not null,
  used_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Resumes Table
create table public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  file_url text,
  parsed_content text,
  skills jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Preferences
create table public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  desired_role text,
  experience_level text,
  location text,
  remote_preference boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Jobs Table (Cache from Remotive)
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  remotive_id text unique not null,
  title text not null,
  company text not null,
  description text,
  applies_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Job Matches
create table public.job_matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  relevance_score integer not null,
  match_summary jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, job_id)
);

-- Applications (Kanban)
create type application_status as enum ('saved', 'in_progress', 'applied', 'interview', 'offer', 'rejected');

create table public.applications (
  user_id uuid references public.users(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  status application_status default 'saved',
  cover_letter_text text,
  portfolio_url text,
  optimized_resume_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, job_id)
);

-- RLS Policies
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.users for select using (
  exists (select 1 from public.users where id = auth.uid() and is_admin = true)
);

-- General policies for tables (user can manage their own data)
alter table public.subscriptions enable row level security;
create policy "Users can view own subs" on public.subscriptions for select using (auth.uid() = user_id);

alter table public.credit_transactions enable row level security;
create policy "Users can view own transactions" on public.credit_transactions for select using (auth.uid() = user_id);

alter table public.applications enable row level security;
create policy "Users can view own applications" on public.applications for select using (auth.uid() = user_id);
create policy "Users can create own applications" on public.applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on public.applications for update using (auth.uid() = user_id);

alter table public.promo_codes enable row level security;
create policy "Anyone can read promo codes" on public.promo_codes for select using (true);
create policy "Admins can manage promo codes" on public.promo_codes for all using (
  exists (select 1 from public.users where id = auth.uid() and is_admin = true)
);
