-- Create guests table
create table if not exists public.guests (
    id uuid primary key default gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    profile_picture text,
    timezone text default 'UTC',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.guests enable row level security;