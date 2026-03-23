-- additional guest info that the client side platform will provide

ALTER TABLE public.guests
ADD COLUMN phone TEXT,
ADD COLUMN email TEXT,
ADD COLUMN preferences TEXT,
ADD COLUMN notes TEXT;