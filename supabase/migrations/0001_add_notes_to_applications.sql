-- Add notes column to applications table for Feature 6
alter table public.applications add column if not exists notes text;
