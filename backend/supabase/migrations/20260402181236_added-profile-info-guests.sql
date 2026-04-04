ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS pronouns TEXT,
    ADD COLUMN IF NOT EXISTS do_not_disturb_start TIME,
    ADD COLUMN IF NOT EXISTS do_not_disturb_end TIME,
    ADD COLUMN IF NOT EXISTS housekeeping_cadence TEXT,
    ADD COLUMN IF NOT EXISTS assistance JSONB DEFAULT '{}';