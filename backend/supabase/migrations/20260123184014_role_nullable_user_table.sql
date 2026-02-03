-- Role must be optional to allow for initial log in without "onboarding" info
ALTER TABLE public.users
ALTER COLUMN role DROP NOT NULL;