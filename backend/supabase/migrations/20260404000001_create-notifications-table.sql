-- Create notifications table
create table if not exists public.notifications (
    id         uuid        primary key default gen_random_uuid(),
    user_id    text        not null references public.users(id) on delete cascade,
    type       text        not null,
    title      text        not null,
    body       text        not null,
    data       jsonb,
    read_at    timestamptz,
    created_at timestamptz default now()
);

create index if not exists idx_notifications_user_id_created_at
    on public.notifications (user_id, created_at desc);

-- Enable RLS
alter table public.notifications enable row level security;
