-- Create views table (saved filter sets per user)
create table if not exists public.views (
    id         uuid        primary key default gen_random_uuid(),
    user_id    text        not null references public.users(id) on delete cascade,
    slug       text        not null,
    filters    jsonb       not null default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_views_user_id
    on public.views (user_id);

-- Enable RLS
alter table public.views enable row level security;
