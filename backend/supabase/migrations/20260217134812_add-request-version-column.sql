-- DEFAULT NOW() is not what we want but is necesarry with a NOT NULL expression
ALTER TABLE public.requests
ADD COLUMN request_version TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.requests
SET request_version = created_at;

-- drop default expression so that we can specify ourselves what we want for future inserts
-- this is just to modify existing data that we already have in the DB
ALTER TABLE public.requests
ALTER COLUMN request_version DROP DEFAULT;
