-- drop all fks referencing hotels.id
ALTER TABLE public.users DROP CONSTRAINT users_hotel_id_fkey;
ALTER TABLE public.guest_bookings DROP CONSTRAINT guest_bookings_hotel_id_fkey;
ALTER TABLE public.requests DROP CONSTRAINT requests_hotel_id_fkey;
ALTER TABLE public.rooms DROP CONSTRAINT rooms_hotel_id_fkey;

-- change hotels.id to text and constraint of floors
ALTER TABLE public.hotels
    ALTER COLUMN id TYPE text,
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN floors DROP NOT NULL,
    ALTER COLUMN floors DROP DEFAULT;

-- change all hotel_id columns to text
ALTER TABLE public.users ALTER COLUMN hotel_id TYPE text;
ALTER TABLE public.guest_bookings ALTER COLUMN hotel_id TYPE text;
ALTER TABLE public.requests ALTER COLUMN hotel_id TYPE text;
ALTER TABLE public.rooms ALTER COLUMN hotel_id TYPE text;

-- re-add all fks
ALTER TABLE public.users
    ADD CONSTRAINT users_hotel_id_fkey
    FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);

ALTER TABLE public.guest_bookings
    ADD CONSTRAINT guest_bookings_hotel_id_fkey
    FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);

ALTER TABLE public.requests
    ADD CONSTRAINT requests_hotel_id_fkey
    FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);

ALTER TABLE public.rooms
    ADD CONSTRAINT rooms_hotel_id_fkey
    FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);