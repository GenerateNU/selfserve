ALTER TABLE public.users
    ADD COLUMN hotel_id uuid REFERENCES public.hotels(id) ON DELETE RESTRICT;

CREATE INDEX idx_users_hotel_id ON public.users (hotel_id);
