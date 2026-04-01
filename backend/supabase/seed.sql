-- =============================================================================
-- Seed: hotel · rooms (floors 1–3) · guests · guest_bookings
-- =============================================================================
-- Run with:
--   cd backend && make seed
--   — or —
--   bash scripts/seed.sh
--
-- Automatically run by `supabase db reset`.
-- All INSERTs are idempotent (ON CONFLICT DO NOTHING with fixed UUIDs).
-- The postgres superuser bypasses RLS, so no policy changes are needed.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Hotel
-- -----------------------------------------------------------------------------
INSERT INTO public.hotels (id, name, floors)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grand Hotel', 5)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Rooms  (3 per floor, floors 1–3)
-- -----------------------------------------------------------------------------
INSERT INTO public.rooms (id, room_number, floor, suite_type, room_status, features, hotel_id)
VALUES
  -- Floor 1
  ('10000000-0000-0000-0000-000000000101', 101, 1, 'standard',  'available',
   ARRAY['wifi','tv'],                              'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000102', 102, 1, 'deluxe',    'occupied',
   ARRAY['wifi','tv','minibar'],                    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000103', 103, 1, 'suite',     'available',
   ARRAY['wifi','tv','jacuzzi','minibar'],           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

  -- Floor 2
  ('10000000-0000-0000-0000-000000000201', 201, 2, 'standard',  'available',
   ARRAY['wifi','tv'],                              'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000202', 202, 2, 'deluxe',    'occupied',
   ARRAY['wifi','tv','balcony'],                    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000203', 203, 2, 'penthouse', 'maintenance',
   ARRAY['wifi','tv','kitchen','jacuzzi'],           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

  -- Floor 3
  ('10000000-0000-0000-0000-000000000301', 301, 3, 'standard',  'available',
   ARRAY['wifi','tv'],                              'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000302', 302, 3, 'deluxe',    'available',
   ARRAY['wifi','tv','balcony'],                    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000303', 303, 3, 'suite',     'occupied',
   ARRAY['wifi','tv','jacuzzi','minibar','balcony'], 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Guests
-- Rooms 102, 202, 303 are occupied (active bookings below).
-- Room 101 has an inactive (past) booking — should NOT appear as occupied.
-- -----------------------------------------------------------------------------
INSERT INTO public.guests (id, first_name, last_name, profile_picture, timezone, phone, email, preferences, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Alice', 'Johnson',  NULL, 'America/New_York',
   '+1 (212) 555-0101', 'alice.johnson@example.com', 'Extra pillows, high floor preferred', 'VIP — champagne on arrival'),

  ('a0000000-0000-0000-0000-000000000002', 'Bob',   'Smith',    NULL, 'America/Chicago',
   '+1 (312) 555-0102', 'bob.smith@example.com',    'Hypoallergenic bedding', NULL),

  ('a0000000-0000-0000-0000-000000000003', 'Carol', 'Williams', NULL, 'America/Los_Angeles',
   '+1 (310) 555-0103', 'carol.williams@example.com', 'No feather pillows, quiet room', 'Celebrating anniversary'),

  ('a0000000-0000-0000-0000-000000000004', 'David', 'Brown',    NULL, 'Europe/London',
   '+44 20 7946 0104', 'david.brown@example.com',   NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Guest bookings
--   active   → guest currently checked in (arrival ≤ today ≤ departure)
--   inactive → past stay; must NOT appear in occupied room listings
--
-- Relationships:
--   Alice  (a...001) → room 102 (10...102) — active
--   Bob    (a...002) → room 202 (10...202) — active
--   Carol  (a...003) → room 303 (10...303) — active
--   David  (a...004) → room 101 (10...101) — inactive (past stay)
-- -----------------------------------------------------------------------------
INSERT INTO public.guest_bookings (id, guest_id, room_id, hotel_id, arrival_date, departure_date, notes, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000102',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-20', '2026-03-28', 'Early check-in requested', 'active'),

  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000202',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-22', '2026-03-26', NULL, 'active'),

  ('b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000303',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-21', '2026-03-30', 'No feather pillows please', 'active'),

  ('b0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000101',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-01', '2026-03-07', NULL, 'inactive')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Quick sanity-check (printed after the transaction commits)
SELECT 'hotels'         AS "table", COUNT(*) FROM public.hotels        WHERE id       = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
UNION ALL
SELECT 'rooms',                      COUNT(*) FROM public.rooms         WHERE hotel_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
UNION ALL
SELECT 'guests',                     COUNT(*) FROM public.guests        WHERE id::text LIKE 'a0000000%'
UNION ALL
SELECT 'guest_bookings',             COUNT(*) FROM public.guest_bookings WHERE id::text LIKE 'b0000000%';
