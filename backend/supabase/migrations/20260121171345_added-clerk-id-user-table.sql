-- added clerk id (from auth integration to user table)
ALTER TABLE public.users
ADD COLUMN clerk_id uuid TEXT NOT NULL UNIQUE;