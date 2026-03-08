-- Create guests table
Create TYPE suite_type_enum AS ENUM ('Single', 'Double', 'Queen', 'King');

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number INTEGER NOT NULL,
    suite_type suite_type_enum NOT NULL,
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

--Enable RLS 
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;