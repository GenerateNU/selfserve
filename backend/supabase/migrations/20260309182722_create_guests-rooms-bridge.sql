CREATE TABLE IF NOT EXISTS public.guest_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guest_bookings_guest_id ON public.guest_bookings (guest_id);
CREATE INDEX idx_guest_bookings_room_id ON public.guest_bookings (room_id);

--Enable RLS 
ALTER TABLE public.guest_bookings ENABLE ROW LEVEL SECURITY;