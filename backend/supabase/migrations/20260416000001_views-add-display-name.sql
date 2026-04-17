alter table public.views
    add column display_name text not null default '';

alter table public.views
    alter column display_name drop default;

create index if not exists idx_views_user_id_slug
    on public.views (user_id, slug);
