-- make clerk id be the actual pk and drop db generated id column, adjusting the foreign key
-- in requests table

ALTER TABLE public.requests
    DROP COLUMN user_id;

ALTER TABLE public.users
    DROP COLUMN id,
    ADD PRIMARY KEY (clerk_id);

ALTER TABLE public.users RENAME COLUMN clerk_id TO id;

ALTER TABLE public.requests
    ADD COLUMN user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL;

