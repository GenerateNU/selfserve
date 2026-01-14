-- Create the hotels table
create table if not exists public.hotels (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    floors integer not null default 1,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);