ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS changed_by text REFERENCES public.users(id) ON DELETE SET NULL;
