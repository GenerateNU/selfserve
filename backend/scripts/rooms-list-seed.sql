-- =============================================================================
-- Seed: hotel · rooms (floors 1–3) · guests · guest_bookings
-- =============================================================================
-- Run with:
--   psql postgresql://postgres:postgres@localhost:54322/postgres -f scripts/seed.sql
--
-- All INSERTs are idempotent (ON CONFLICT DO NOTHING with fixed UUIDs).
-- The postgres superuser bypasses RLS, so no policy changes are needed.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Hotel
-- -----------------------------------------------------------------------------
INSERT INTO public.hotels (id, name, floors)
VALUES ('00000000-0000-0000-0000-000000000001', 'Grand Hotel', 5)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Rooms  (3 per floor, floors 1–3)
-- Naming convention: 1XXXXXXXXXXX0<floor><room_within_floor>
-- -----------------------------------------------------------------------------
INSERT INTO public.rooms (id, room_number, floor, suite_type, room_status, features, hotel_id)
VALUES
  -- Floor 1
  ('10000000-0000-0000-0000-000000000101', 101, 1, 'standard',  'available',
   ARRAY['wifi','tv'],                           '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000102', 102, 1, 'deluxe',    'occupied',
   ARRAY['wifi','tv','minibar'],                 '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000103', 103, 1, 'suite',     'available',
   ARRAY['wifi','tv','jacuzzi','minibar'],        '00000000-0000-0000-0000-000000000001'),

  -- Floor 2
  ('10000000-0000-0000-0000-000000000201', 201, 2, 'standard',  'available',
   ARRAY['wifi','tv'],                           '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000202', 202, 2, 'deluxe',    'occupied',
   ARRAY['wifi','tv','balcony'],                 '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000203', 203, 2, 'penthouse', 'maintenance',
   ARRAY['wifi','tv','kitchen','jacuzzi'],        '00000000-0000-0000-0000-000000000001'),

  -- Floor 3
  ('10000000-0000-0000-0000-000000000301', 301, 3, 'standard',  'available',
   ARRAY['wifi','tv'],                           '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000302', 302, 3, 'deluxe',    'available',
   ARRAY['wifi','tv','balcony'],                 '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000303', 303, 3, 'suite',     'occupied',
   ARRAY['wifi','tv','jacuzzi','minibar','balcony'], '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Guests
-- -----------------------------------------------------------------------------
INSERT INTO public.guests (id, first_name, last_name, profile_picture, timezone)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Alice', 'Johnson',  NULL, 'America/New_York'),
  ('a0000000-0000-0000-0000-000000000002', 'Bob',   'Smith',    NULL, 'America/Chicago'),
  ('a0000000-0000-0000-0000-000000000003', 'Carol', 'Williams', NULL, 'America/Los_Angeles'),
  ('a0000000-0000-0000-0000-000000000004', 'David', 'Brown',    NULL, 'Europe/London')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Guest bookings
--   active   → guest appears on the room in GET /api/v1/rooms
--   inactive → filtered out (verifies the LEFT JOIN WHERE status = 'active')
-- -----------------------------------------------------------------------------
INSERT INTO public.guest_bookings (id, guest_id, room_id, arrival_date, departure_date, notes, status)
VALUES
  -- Alice in room 102 (floor 1) — active
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000102',
   '2026-03-10', '2026-03-17', 'Early check-in requested', 'active'),

  -- Bob in room 202 (floor 2) — active
  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000202',
   '2026-03-12', '2026-03-15', NULL, 'active'),

  -- Carol in room 303 (floor 3) — active
  ('b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000303',
   '2026-03-13', '2026-03-20', 'No feather pillows please', 'active'),

  -- David in room 101 (floor 1) — inactive; must NOT appear in the rooms response
  ('b0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000101',
   '2026-03-01', '2026-03-07', NULL, 'inactive')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Quick sanity-check (printed after the transaction commits)
SELECT 'hotels'        AS "table", COUNT(*) FROM public.hotels        WHERE id  = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'rooms',                    COUNT(*) FROM public.rooms          WHERE hotel_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'guests',                   COUNT(*) FROM public.guests         WHERE id::text LIKE 'a0000000%'
UNION ALL
SELECT 'guest_bookings',           COUNT(*) FROM public.guest_bookings WHERE id::text LIKE 'b0000000%';
