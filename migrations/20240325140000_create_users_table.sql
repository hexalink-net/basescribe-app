-- Create users table
create table users (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  plan_type text not null default 'free',
  total_usage_minutes integer default 0,
  monthly_usage_minutes integer default 0,
  created_at timestamp with time zone default now(),
  plan_id text,
  paddle_id text,
  last_reset_date date
);

-- Enable RLS
alter table users enable row level security;
