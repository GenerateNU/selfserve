-- Create device_tokens table for mobile push notifications
create table if not exists public.device_tokens (
    id         uuid        primary key default gen_random_uuid(),
    user_id    text        not null references public.users(id) on delete cascade,
    token      text        not null,
    platform   text        not null, -- 'ios' | 'android'
    created_at timestamptz default now(),
    unique (user_id, token)
);

-- Enable RLS
alter table public.device_tokens enable row level security;
