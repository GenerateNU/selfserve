ALTER TABLE public.guest_bookings
    ADD COLUMN hotel_id uuid REFERENCES public.hotels(id) ON DELETE RESTRICT;

CREATE INDEX idx_guest_bookings_hotel_id ON public.guest_bookings (hotel_id);
