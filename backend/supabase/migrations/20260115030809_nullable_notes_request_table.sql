-- make notes nullable in the requests table
ALTER TABLE public.requests
ALTER COLUMN notes DROP NOT NULL;