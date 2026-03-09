CREATE TABLE IF NOT EXISTS public.guest_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    notes TEXT,
    status string NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
);

--Enable RLS 
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;