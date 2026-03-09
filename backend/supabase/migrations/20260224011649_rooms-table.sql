-- Create guests table
Create TYPE suite_type_enum AS ENUM ('Single', 'Double', 'Queen', 'King');

Create TYPE room_status_enum AS ENUM('OCCUPIED, AVAILABLE');

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number INTEGER NOT NULL,
    floor INTEGER NOT NULL,
    suite_type suite_type_enum NOT NULL,
    room_status room_status_enum NOT NULL,
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
);

--Enable RLS 
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;