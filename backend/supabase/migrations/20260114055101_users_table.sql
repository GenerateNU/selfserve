-- Create users table
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    employee_id text unique,
    profile_picture text,
    role text not null,
    department text,
    timezone text default 'UTC',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;