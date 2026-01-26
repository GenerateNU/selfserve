-- added clerk id (from auth integration to user table)
ALTER TABLE public.users
ADD COLUMN clerk_id TEXT NOT NULL UNIQUE;