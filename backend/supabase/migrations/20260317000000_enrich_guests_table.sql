ALTER TABLE public.guests
    ADD COLUMN preferred_name TEXT,
    ADD COLUMN date_of_birth DATE,
    ADD COLUMN phone_number TEXT,
    ADD COLUMN email TEXT,
    ADD COLUMN notes TEXT;
