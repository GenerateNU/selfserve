-- Create requests table
create table if not exists public.requests (
    id uuid primary key default gen_random_uuid(),
    hotel_id uuid not null references public.hotels(id) on delete cascade,
    guest_id uuid,
    user_id uuid references public.users(id) on delete set null,
    reservation_id text,
    name text not null,
    description text,
    room_id text,
    request_category text,
    request_type text not null,
    department text,
    status text not null,
    priority text not null,
    estimated_completion_time integer, -- in minutes
    scheduled_time timestamptz,
    completed_at timestamptz,
    notes text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.requests enable row level security;
