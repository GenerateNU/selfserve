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
-- Users
-- -----------------------------------------------------------------------------
INSERT INTO public.users (id, first_name, last_name, role, hotel_id)
VALUES ('user_3BgSkSK6KDYGD1VJRZvyO4MVF7L', 'Dev', 'User', 'admin', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Rooms  (3 per floor, floors 1–3)
-- -----------------------------------------------------------------------------
INSERT INTO public.rooms (id, room_number, floor, suite_type, room_status, is_accessible, features, hotel_id)
VALUES
  -- Floor 1
  ('10000000-0000-0000-0000-000000000101', 101, 1, 'standard',  'available',
   TRUE,
   ARRAY['wifi','tv'],                              'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000102', 102, 1, 'deluxe',    'occupied',
   FALSE,
   ARRAY['wifi','tv','minibar'],                    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000103', 103, 1, 'suite',     'available',
   FALSE,
   ARRAY['wifi','tv','jacuzzi','minibar'],           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

  -- Floor 2
  ('10000000-0000-0000-0000-000000000201', 201, 2, 'standard',  'occupied',
   TRUE,
   ARRAY['wifi','tv'],                              'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000202', 202, 2, 'deluxe',    'occupied',
   FALSE,
   ARRAY['wifi','tv','balcony'],                    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000203', 203, 2, 'penthouse', 'maintenance',
   FALSE,
   ARRAY['wifi','tv','kitchen','jacuzzi'],           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

  -- Floor 3
  ('10000000-0000-0000-0000-000000000301', 301, 3, 'standard',  'available',
   FALSE,
   ARRAY['wifi','tv'],                              'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000302', 302, 3, 'deluxe',    'occupied',
   TRUE,
   ARRAY['wifi','tv','balcony'],                    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('10000000-0000-0000-0000-000000000303', 303, 3, 'suite',     'occupied',
   FALSE,
   ARRAY['wifi','tv','jacuzzi','minibar','balcony'], 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.requests (
  id, request_version, hotel_id, guest_id, user_id, room_id,
  name, description, request_category, request_type, department,
  status, priority, estimated_completion_time, scheduled_time, completed_at, notes, created_at
)
VALUES

  -- ── Pending (10) ─────────────────────────────────────────────────────────

  ('c0000000-0000-0000-0000-000000000001', '2026-04-01 00:01:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000001', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000102',
   'Extra towels',
   'Guest requested 2 extra bath towels and 1 hand towel. Prefers Egyptian cotton if available.',
   'Linen & Towels', 'on demand', 'Housekeeping',
   'pending', 'medium', 15,
   '2026-04-01 10:00:00+00', NULL,
   'Alice mentioned she has guests visiting. Deliver to door if DND is not active.',
   '2026-04-01 09:00:00+00'),

  ('c0000000-0000-0000-0000-000000000002', '2026-04-01 00:02:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000002', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000202',
   'AC thermostat unresponsive',
   'Thermostat display is blank and does not respond to input. Room temperature rising above 26°C.',
   'HVAC', 'on demand', 'Maintenance',
   'pending', 'high', 45,
   '2026-04-01 11:00:00+00', NULL,
   'Guest has a medical condition requiring cool room. Prioritize immediately.',
   '2026-04-01 09:15:00+00'),

  ('c0000000-0000-0000-0000-000000000003', '2026-04-01 00:03:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000003', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000303',
   'In-room safe malfunction',
   'Guest is unable to open the in-room safe. Keypad is unresponsive and display shows error E3.',
   'Hardware', 'on demand', 'Maintenance',
   'pending', 'high', 30,
   '2026-04-01 12:00:00+00', NULL,
   'Guest has passport and valuables inside. Do NOT force open — use override key from security.',
   '2026-04-01 09:30:00+00'),

  ('c0000000-0000-0000-0000-000000000004', '2026-04-01 00:04:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000101',
   'Late checkout request',
   'Guest is requesting a late checkout at 2:00 PM instead of the standard 11:00 AM.',
   'Checkout', 'on demand', 'Front Desk',
   'pending', 'low', 5,
   '2026-04-01 13:00:00+00', NULL,
   'Confirm room availability before approving. Guest is a loyalty member — accommodate if possible.',
   '2026-04-01 08:00:00+00'),

  ('c0000000-0000-0000-0000-000000000005', '2026-04-01 00:05:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000201',
   'Baby crib delivery',
   'Family with 8-month-old infant requesting a standard travel crib with fitted sheet.',
   'Baby Amenities', 'on demand', 'Housekeeping',
   'pending', 'medium', 20,
   '2026-04-01 14:00:00+00', NULL,
   'Ensure crib is sanitized and all parts are present before delivery. Baby blanket optional.',
   '2026-04-01 10:00:00+00'),

  ('c0000000-0000-0000-0000-000000000006', '2026-04-01 00:06:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000302',
   'Restaurant reservation for tonight',
   'Guest requests a table for 2 at the hotel restaurant at 7:30 PM. Prefers window seating.',
   'Dining', 'on demand', 'Concierge',
   'pending', 'low', 10,
   '2026-04-01 19:30:00+00', NULL,
   'Guest mentioned it is a first date. Arrange rose on table if possible.',
   '2026-04-01 11:00:00+00'),

  ('c0000000-0000-0000-0000-000000000007', '2026-04-01 00:07:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000103',
   'Key card replacement',
   'Guest reports losing one of their two key cards. Requesting an immediate replacement.',
   'Access', 'on demand', 'Front Desk',
   'pending', 'medium', 5,
   '2026-04-01 10:30:00+00', NULL,
   'Deactivate the old card immediately and verify guest identity before issuing replacement.',
   '2026-04-01 10:15:00+00'),

  ('c0000000-0000-0000-0000-000000000008', '2026-04-01 00:08:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000203',
   'Leaking bathroom faucet',
   'Bathroom sink faucet is dripping constantly. Guest estimates about 1 drip per second.',
   'Plumbing', 'on demand', 'Maintenance',
   'pending', 'medium', 60,
   '2026-04-01 15:00:00+00', NULL,
   'Check both hot and cold lines. Bring washer and O-ring replacement kits.',
   '2026-04-01 09:45:00+00'),

  ('c0000000-0000-0000-0000-000000000009', '2026-04-01 00:09:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000003', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000303',
   'Champagne and strawberries delivery',
   'Guest is celebrating anniversary and requested a bottle of Moët & Chandon with fresh strawberries and chocolates.',
   'Room Service', 'on demand', 'Food & Beverage',
   'pending', 'medium', 15,
   '2026-04-01 20:00:00+00', NULL,
   'Arrange rose petal presentation on tray. Guest is celebrating 5th anniversary.',
   '2026-04-01 12:00:00+00'),

  ('c0000000-0000-0000-0000-000000000010', '2026-04-01 00:10:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000301',
   'Noise complaint from adjacent room',
   'Guest in room 301 is reporting loud music and voices from room 302 since 11:30 PM.',
   'Guest Relations', 'on demand', 'Front Desk',
   'pending', 'high', 10,
   '2026-04-01 23:45:00+00', NULL,
   'Approach room 302 discreetly. If noise continues after first warning, escalate to manager.',
   '2026-04-01 23:30:00+00'),

  -- ── In Progress (10) ─────────────────────────────────────────────────────

  ('c0000000-0000-0000-0000-000000000011', '2026-04-01 00:11:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000001', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000102',
   'Full room cleaning',
   'Guest requested a full room cleaning: vacuuming, bathroom scrub, fresh linen, and restocking of all toiletries.',
   'Room Cleaning', 'recurring', 'Housekeeping',
   'in progress','medium', 40,
   '2026-04-01 14:00:00+00', NULL,
   'Guest prefers unscented cleaning products. Note allergy to lavender on file.',
   '2026-04-01 08:30:00+00'),

  ('c0000000-0000-0000-0000-000000000012', '2026-04-01 00:12:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000002', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000202',
   'Minibar restock',
   'Guest consumed all sparkling water and soft drinks. Requesting full minibar restock including snacks.',
   'Minibar', 'on demand', 'Food & Beverage',
   'in progress','low', 20,
   '2026-04-01 16:00:00+00', NULL,
   'Guest requested extra sparkling water (x4) and no beer. Add mixed nuts and chocolate.',
   '2026-04-01 10:00:00+00'),

  ('c0000000-0000-0000-0000-000000000013', '2026-04-01 00:13:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000003', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000303',
   'Overnight shoe shine',
   'Guest left 2 pairs of dress shoes outside the door: one black Oxford, one tan leather pump.',
   'Valet', 'on demand', 'Concierge',
   'in progress','low', 30,
   '2026-04-02 07:00:00+00', NULL,
   'Return before 7 AM. Black shoes take high gloss, tan shoes take matte. No resoling.',
   '2026-04-01 21:00:00+00'),

  ('c0000000-0000-0000-0000-000000000014', '2026-04-01 00:14:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000101',
   'WiFi connection issues',
   'Guest laptop is unable to connect to hotel WiFi. Other devices in room connect fine. Error: "Authentication failed".',
   'Network', 'on demand', 'Maintenance',
   'in progress','medium', 20,
   '2026-04-01 11:30:00+00', NULL,
   'Bring a network extender as a backup. Guest is on a work call at 2 PM and needs stable connection.',
   '2026-04-01 10:30:00+00'),

  ('c0000000-0000-0000-0000-000000000015', '2026-04-01 00:15:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000201',
   'Extra pillows requested',
   'Guest is requesting 2 additional firm pillows for back support. No feather pillows per profile.',
   'Linen & Towels', 'on demand', 'Housekeeping',
   'in progress','low', 10,
   '2026-04-01 15:00:00+00', NULL,
   'Memory foam or hypoallergenic pillows preferred. Check notes on guest profile.',
   '2026-04-01 13:00:00+00'),

  ('c0000000-0000-0000-0000-000000000016', '2026-04-01 00:16:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000302',
   'Morning newspaper delivery',
   'Guest requested daily delivery of the Financial Times and local newspaper before 7:30 AM.',
   'Amenities', 'recurring', 'Concierge',
   'in progress','low', 5,
   '2026-04-02 07:30:00+00', NULL,
   'Guest prefers papers left outside door without knocking. Fold neatly.',
   '2026-04-01 20:00:00+00'),

  ('c0000000-0000-0000-0000-000000000017', '2026-04-01 00:17:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000103',
   'Towel replacement',
   'Towels in room are stained. Guest requesting a fresh set of 4 bath towels and 2 hand towels.',
   'Linen & Towels', 'on demand', 'Housekeeping',
   'in progress','low', 15,
   '2026-04-01 13:30:00+00', NULL,
   'Collect old towels. Guest expressed dissatisfaction — apologize and offer complimentary amenity.',
   '2026-04-01 12:30:00+00'),

  ('c0000000-0000-0000-0000-000000000018', '2026-04-01 00:18:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000203',
   'Pool towel delivery',
   'Guest is heading to the pool and requested 4 large pool towels delivered to their room first.',
   'Pool', 'on demand', 'Housekeeping',
   'in progress','medium', 10,
   '2026-04-01 12:00:00+00', NULL,
   'Deliver to room 203 if guest has not yet left. Otherwise deliver directly to pool deck.',
   '2026-04-01 11:30:00+00'),

  ('c0000000-0000-0000-0000-000000000019', '2026-04-01 00:19:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000301',
   'Luggage storage after checkout',
   'Guest is checking out at 11 AM but flight departs at 8 PM. Requesting secure storage for 2 suitcases and 1 carry-on.',
   'Luggage', 'on demand', 'Concierge',
   'in progress','medium', 15,
   '2026-04-01 11:00:00+00', NULL,
   'Issue luggage claim ticket. Store in secure room B. Guest will collect between 5–6 PM.',
   '2026-04-01 09:00:00+00'),

  ('c0000000-0000-0000-0000-000000000020', '2026-04-01 00:20:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000002', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000202',
   'Wake-up call at 6:30 AM',
   'Guest has an early morning flight and requested a phone wake-up call at 6:30 AM with a follow-up at 6:45 AM if no answer.',
   'Alarm', 'scheduled', 'Front Desk',
   'in progress','low', 5,
   '2026-04-02 06:30:00+00', NULL,
   'Set both primary and backup calls. Guest checkout is at 7:30 AM — arrange taxi if requested.',
   '2026-04-01 22:00:00+00'),

  -- ── Completed (10) ───────────────────────────────────────────────────────

  ('c0000000-0000-0000-0000-000000000021', '2026-04-01 00:21:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000001', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000102',
   'In-room breakfast delivery',
   'Guest ordered Continental Plus for 2: assorted pastries, fresh fruit, smoked salmon, yoghurt, OJ, and English breakfast tea.',
   'In-Room Dining', 'on demand', 'Food & Beverage',
   'completed', 'medium', 30,
   '2026-04-01 08:00:00+00', '2026-04-01 08:05:00+00',
   'Delivered on time. Guest tipped the team. Very satisfied.',
   '2026-04-01 07:15:00+00'),

  ('c0000000-0000-0000-0000-000000000022', '2026-04-01 00:22:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000003', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000303',
   'Spa appointment booking',
   'Guest requested a 60-minute couples deep tissue massage at the hotel spa at 3:00 PM.',
   'Spa & Wellness', 'on demand', 'Concierge',
   'completed', 'low', 10,
   '2026-04-01 15:00:00+00', '2026-04-01 12:05:00+00',
   'Booked with therapists Mia and James. Guest requested eucalyptus aromatherapy oil.',
   '2026-04-01 11:00:00+00'),

  ('c0000000-0000-0000-0000-000000000023', '2026-04-01 00:23:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000002', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000202',
   'Airport transfer arrangement',
   'Guest requested a private car to JFK Airport for 2 passengers with 3 checked bags. Flight departs at 4:00 PM.',
   'Transportation', 'on demand', 'Concierge',
   'completed', 'medium', 15,
   '2026-04-01 13:00:00+00', '2026-04-01 10:10:00+00',
   'Booked Blacklane — confirmation #BL-48291. Driver: Michael, plates NY-3847. Pickup lobby 1:00 PM.',
   '2026-04-01 09:30:00+00'),

  ('c0000000-0000-0000-0000-000000000024', '2026-04-01 00:24:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000101',
   'Iron and ironing board delivery',
   'Guest requires a steam iron and ironing board to press business attire for a morning meeting.',
   'In-Room Equipment', 'on demand', 'Housekeeping',
   'completed', 'low', 10,
   '2026-04-01 07:00:00+00', '2026-04-01 07:08:00+00',
   'Delivered before 7 AM as requested. Guest has an 8:30 AM board meeting.',
   '2026-04-01 06:45:00+00'),

  ('c0000000-0000-0000-0000-000000000025', '2026-04-01 00:25:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000201',
   'TV remote not working',
   'Guest reports that the TV remote control is unresponsive. Suspected dead batteries.',
   'Electronics', 'on demand', 'Maintenance',
   'completed', 'low', 5,
   '2026-04-01 16:00:00+00', '2026-04-01 16:12:00+00',
   'Replaced AA batteries. Remote tested and functioning. Also adjusted TV input settings at guest request.',
   '2026-04-01 15:55:00+00'),

  ('c0000000-0000-0000-0000-000000000026', '2026-04-01 00:26:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000302',
   'Express laundry pickup',
   'Guest has 3 dress shirts, 1 suit jacket, and 2 pairs of trousers for express laundry. Needs same-day return by 6 PM.',
   'Laundry', 'on demand', 'Housekeeping',
   'completed', 'medium', 60,
   '2026-04-01 09:00:00+00', '2026-04-01 17:45:00+00',
   'Collected at 9:15 AM. Returned and hung at 5:45 PM. Guest confirmed satisfied.',
   '2026-04-01 08:50:00+00'),

  ('c0000000-0000-0000-0000-000000000027', '2026-04-01 00:27:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000103',
   'Medical assistance request',
   'Guest is feeling unwell — headache, nausea, and mild fever. Requesting a doctor visit or medical kit.',
   'Medical', 'on demand', 'Front Desk',
   'completed', 'high', 15,
   '2026-04-01 22:00:00+00', '2026-04-01 22:20:00+00',
   'On-call doctor visited. Diagnosed mild dehydration. Provided electrolytes and paracetamol. Doctor notes filed.',
   '2026-04-01 21:50:00+00'),

  ('c0000000-0000-0000-0000-000000000028', '2026-04-01 00:28:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000203',
   'Valet car retrieval',
   'Guest is checking out and requesting their vehicle (black Tesla Model S, plate NY-1234) at the front entrance.',
   'Valet', 'on demand', 'Concierge',
   'completed', 'medium', 15,
   '2026-04-01 11:30:00+00', '2026-04-01 11:42:00+00',
   'Vehicle retrieved from level 2, spot B14. Guest departed at 11:45 AM. No damage noted.',
   '2026-04-01 11:25:00+00'),

  ('c0000000-0000-0000-0000-000000000029', '2026-04-01 00:29:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000301',
   'Turndown service',
   'Guest opted in for nightly turndown: bed preparation, dim lighting, soft music, and pillow mint.',
   'Turndown', 'recurring', 'Housekeeping',
   'completed', 'low', 20,
   '2026-04-01 20:00:00+00', '2026-04-01 20:18:00+00',
   'Service completed. Left chocolates and hotel note. DND sign was up — slipped card under door.',
   '2026-04-01 19:00:00+00'),

  ('c0000000-0000-0000-0000-000000000030', '2026-04-01 00:30:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000003', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   '10000000-0000-0000-0000-000000000303',
   'Dinner reservation at La Maison',
   'Guest requested a table for 2 at La Maison at 8:00 PM for their 10th wedding anniversary.',
   'Dining', 'on demand', 'Concierge',
   'completed', 'medium', 10,
   '2026-04-01 20:00:00+00', '2026-04-01 13:15:00+00',
   'Confirmed table 8 by window. Arranged complimentary dessert with sparkler from management. Guest was delighted.',
   '2026-04-01 12:00:00+00')

ON CONFLICT (id, request_version) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Guests
-- Rooms 102, 202, 303 are occupied (active bookings below).
-- Room 101 has an inactive (past) booking — should NOT appear as occupied.
-- -----------------------------------------------------------------------------
INSERT INTO public.guests (id, first_name, last_name, profile_picture, timezone, phone, email, preferences, notes,
                          pronouns, do_not_disturb_start, do_not_disturb_end, housekeeping_cadence, assistance)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Alice', 'Johnson',  NULL, 'America/New_York',
   '+1 (212) 555-0101', 'alice.johnson@example.com',
   'Extra pillows, Egyptian cotton linens, high floor preferred',
   'VIP — champagne on arrival. Loyalty member since 2018. Allergy to lavender products.',
   'she/her', '22:00:00', '08:00:00', 'daily', '{}'),

  ('a0000000-0000-0000-0000-000000000002', 'Bob',   'Smith',    NULL, 'America/Chicago',
   '+1 (312) 555-0102', 'bob.smith@example.com',
   'Hypoallergenic bedding, no feather products, firm pillows',
   'Corporate account — Acme Corp. Business traveller, early checkout likely.',
   'he/him', '23:00:00', '07:00:00', 'daily', '{"dietary":["gluten_free"]}'),

  ('a0000000-0000-0000-0000-000000000003', 'Carol', 'Williams', NULL, 'America/Los_Angeles',
   '+1 (310) 555-0103', 'carol.williams@example.com',
   'No feather pillows, quiet room, low-level floor preferred',
   'Celebrating anniversary. Requested rose petal turndown on 2026-04-02.',
   'she/her', '21:00:00', '09:00:00', 'every_other_day', '{"medical":["low_noise_environment"]}'),

  ('a0000000-0000-0000-0000-000000000004', 'David', 'Brown',    NULL, 'Europe/London',
   '+44 20 7946 0104', 'david.brown@example.com',
   'Earl Grey tea on arrival, Financial Times delivered daily',
   'Regular guest — previous stays in 2024 and 2025. Prefers ground floor.',
   'he/him', NULL, NULL, 'daily', '{}'),

  ('a0000000-0000-0000-0000-000000000005', 'Emma',  'Davis',    NULL, 'America/New_York',
   '+1 (646) 555-0105', 'emma.davis@example.com',
   'Crib required (infant), blackout curtains, quiet room',
   'Family with 8-month-old infant. Baby amenities pre-arranged.',
   'she/her', '20:00:00', '09:00:00', 'daily', '{"dietary":["nut_free"]}'),

  ('a0000000-0000-0000-0000-000000000006', 'Liam',  'Garcia',   NULL, 'America/Denver',
   '+1 (720) 555-0106', 'liam.garcia@example.com',
   'Accessible bathroom, roll-in shower, lowered bed if available',
   'Uses manual wheelchair. Requires accessible room features.',
   'he/him', NULL, NULL, 'daily', '{"accessibility":["wheelchair","roll_in_shower"]}')
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
INSERT INTO public.guest_bookings (id, guest_id, room_id, hotel_id, arrival_date, departure_date, notes, status, group_size)
VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000102',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-20', '2026-03-28', 'Early check-in requested', 'active', 1),

  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000202',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-22', '2026-03-26', NULL, 'active', 2),

  ('b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000303',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-21', '2026-03-30', 'No feather pillows please', 'active', 2),

  ('b0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000101',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-01', '2026-03-07', NULL, 'inactive', NULL),

  ('b0000000-0000-0000-0000-000000000005',
   'a0000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000201',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-25', '2026-04-02', 'Crib pre-arranged', 'active', 3),

  ('b0000000-0000-0000-0000-000000000006',
   'a0000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000302',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '2026-03-28', '2026-04-05', 'Accessible room confirmed', 'active', 1)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Requests — 5 versions of the same request (composite PK: id + request_version)
-- All share the same created_at (original creation time) and scheduled_time 06:00.
-- The latest request_version is what FindRequestsByStatusPaginated will surface.
-- -----------------------------------------------------------------------------
INSERT INTO public.requests (id, hotel_id, user_id, name, request_type, status, priority, room_id, department, scheduled_time, created_at, request_version)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   'room cleaning', 'recurring', 'pending', 'normal', '102', 'Housekeeping',
   '2026-03-31T06:00:00Z', '2026-03-31T01:00:00Z', '2026-03-31T01:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   'room cleaning', 'recurring', 'pending', 'normal', '102', 'Housekeeping',
   '2026-03-31T06:00:00Z', '2026-03-31T01:00:00Z', '2026-03-31T02:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   'room cleaning', 'recurring', 'pending', 'high', '102', 'Housekeeping',
   '2026-03-31T06:00:00Z', '2026-03-31T01:00:00Z', '2026-03-31T03:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   'room cleaning', 'recurring', 'pending', 'high', '102', 'Housekeeping',
   '2026-03-31T06:00:00Z', '2026-03-31T01:00:00Z', '2026-03-31T04:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
   'room cleaning', 'recurring', 'pending', 'urgent', '102', 'Housekeeping',
   '2026-03-31T06:00:00Z', '2026-03-31T01:00:00Z', '2026-03-31T05:00:00Z')
ON CONFLICT (id, request_version) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Requests — 300 bulk rows: 100 pending · 100 in progress · 100 completed
-- UUIDs are deterministic (md5 of status+index) so the seed is idempotent.
-- scheduled_time cycles through 08:00–19:00 (never below 8AM).
-- -----------------------------------------------------------------------------
INSERT INTO public.requests (id, hotel_id, user_id, name, request_type, status, priority, room_id, department, scheduled_time, created_at, request_version)
SELECT
  md5('pending' || i::text)::uuid,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
  (ARRAY['room cleaning','towel replacement','minibar refill','maintenance repair','extra pillows',
         'wake-up call','laundry pickup','concierge request','turndown service','luggage assistance'])[((i-1) % 10) + 1],
  (ARRAY['recurring','one-time'])[((i-1) % 2) + 1],
  'pending',
  (ARRAY['low','medium','normal','high','urgent'])[((i-1) % 5) + 1],
  (ARRAY['101','102','103','201','202','203','301','302','303'])[((i-1) % 9) + 1],
  (ARRAY['Housekeeping','Maintenance','Concierge','Food & Beverage','Front Desk'])[((i-1) % 5) + 1],
  '2026-03-31'::date + '08:00:00'::interval + (((i-1) % 12) || ' hours')::interval,
  '2026-03-01'::timestamptz + (i || ' hours')::interval,
  '2026-03-01'::timestamptz + (i || ' hours')::interval
FROM generate_series(1, 100) AS i
ON CONFLICT (id, request_version) DO NOTHING;

INSERT INTO public.requests (id, hotel_id, user_id, name, request_type, status, priority, room_id, department, scheduled_time, created_at, request_version)
SELECT
  md5('assigned' || i::text)::uuid,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
  (ARRAY['room cleaning','towel replacement','minibar refill','maintenance repair','extra pillows',
         'wake-up call','laundry pickup','concierge request','turndown service','luggage assistance'])[((i-1) % 10) + 1],
  (ARRAY['recurring','one-time'])[((i-1) % 2) + 1],
  'in progress',
  (ARRAY['low','medium','normal','high','urgent'])[((i-1) % 5) + 1],
  (ARRAY['101','102','103','201','202','203','301','302','303'])[((i-1) % 9) + 1],
  (ARRAY['Housekeeping','Maintenance','Concierge','Food & Beverage','Front Desk'])[((i-1) % 5) + 1],
  '2026-03-31'::date + '08:00:00'::interval + (((i-1) % 12) || ' hours')::interval,
  '2026-03-02'::timestamptz + (i || ' hours')::interval,
  '2026-03-02'::timestamptz + (i || ' hours')::interval
FROM generate_series(1, 100) AS i
ON CONFLICT (id, request_version) DO NOTHING;

INSERT INTO public.requests (id, hotel_id, user_id, name, request_type, status, priority, room_id, department, scheduled_time, created_at, request_version)
SELECT
  md5('completed' || i::text)::uuid,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L',
  (ARRAY['room cleaning','towel replacement','minibar refill','maintenance repair','extra pillows',
         'wake-up call','laundry pickup','concierge request','turndown service','luggage assistance'])[((i-1) % 10) + 1],
  (ARRAY['recurring','one-time'])[((i-1) % 2) + 1],
  'completed',
  (ARRAY['low','medium','normal','high','urgent'])[((i-1) % 5) + 1],
  (ARRAY['101','102','103','201','202','203','301','302','303'])[((i-1) % 9) + 1],
  (ARRAY['Housekeeping','Maintenance','Concierge','Food & Beverage','Front Desk'])[((i-1) % 5) + 1],
  '2026-03-31'::date + '08:00:00'::interval + (((i-1) % 12) || ' hours')::interval,
  '2026-03-03'::timestamptz + (i || ' hours')::interval,
  '2026-03-03'::timestamptz + (i || ' hours')::interval
FROM generate_series(1, 100) AS i
ON CONFLICT (id, request_version) DO NOTHING;

-- Requests
--   Mix of statuses and priorities across occupied rooms (102, 202, 303)
--   and unoccupied rooms to test filtering.
-- -----------------------------------------------------------------------------
INSERT INTO public.requests (id, request_version, hotel_id, guest_id, room_id, name, description, request_category, request_type, department, status, priority, estimated_completion_time, notes, created_at)
VALUES
  -- Room 102 (Alice, occupied) — pending towel request
  ('c0000000-0000-0000-0000-000000000001', '2026-04-01 09:00:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000102',
   'Extra towels', 'Guest requested 2 extra bath towels',
   'Housekeeping', 'on demand', 'housekeeping',
   'pending', 'medium', 15, '', '2026-04-01 09:00:00+00'),

  -- Room 102 (Alice, occupied) — completed minibar restock
  ('c0000000-0000-0000-0000-000000000002', '2026-04-01 10:30:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000102',
   'Minibar restock', 'Please restock the minibar with water and sparkling water',
   'Room Service', 'on demand', 'food & beverage',
   'completed', 'low', 20, '', '2026-04-01 08:00:00+00'),

  -- Room 202 (Bob, occupied) — in progress maintenance
  ('c0000000-0000-0000-0000-000000000003', '2026-04-02 07:15:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000202',
   'AC not cooling', 'Air conditioning unit is blowing warm air',
   'Maintenance', 'on demand', 'maintenance',
   'in progress', 'high', 45, 'Technician dispatched', '2026-04-02 07:00:00+00'),

  -- Room 202 (Bob, occupied) — assigned wake-up call
  ('c0000000-0000-0000-0000-000000000004', '2026-04-02 06:00:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000202',
   'Wake-up call', 'Requested wake-up call at 7:00 AM',
   'Concierge', 'scheduled', 'front desk',
   'in progress','low', 5, '', '2026-04-01 22:00:00+00'),

  -- Room 303 (Carol, occupied) — pending high-priority DND override
  ('c0000000-0000-0000-0000-000000000005', '2026-04-02 08:45:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000303',
   'Room cleaning', 'Guest requested full room cleaning and bed linen change',
   'Housekeeping', 'on demand', 'housekeeping',
   'pending', 'high', 40, 'Celebrating anniversary — use rose petal turndown', '2026-04-02 08:30:00+00'),

  -- Room 303 (Carol, occupied) — completed spa booking assistance
  ('c0000000-0000-0000-0000-000000000006', '2026-04-01 14:00:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'a0000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000303',
   'Spa booking', 'Guest requested a couples massage appointment for 3 PM',
   'Concierge', 'on demand', 'concierge',
   'completed', 'medium', 10, '', '2026-04-01 11:00:00+00'),

  -- Unassigned (no guest, no room) — hotel-level pending request
  ('c0000000-0000-0000-0000-000000000007', '2026-04-02 09:00:00+00',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   NULL, NULL,
   'Pool area inspection', 'Routine safety inspection for pool deck',
   'Maintenance', 'recurring', 'maintenance',
   'pending', 'medium', 60, '', '2026-04-02 09:00:00+00')

ON CONFLICT (id, request_version) DO NOTHING;

COMMIT;

-- Quick sanity-check (printed after the transaction commits)
SELECT 'hotels'         AS "table", COUNT(*) FROM public.hotels        WHERE id       = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
UNION ALL
SELECT 'rooms',                      COUNT(*) FROM public.rooms         WHERE hotel_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
UNION ALL
SELECT 'guests',                     COUNT(*) FROM public.guests        WHERE id::text LIKE 'a0000000%'
UNION ALL
SELECT 'guest_bookings (active)',     COUNT(*) FROM public.guest_bookings WHERE id::text LIKE 'b0000000%' AND status = 'active'
UNION ALL
SELECT 'guest_bookings (inactive)',   COUNT(*) FROM public.guest_bookings WHERE id::text LIKE 'b0000000%' AND status = 'inactive'
UNION ALL
SELECT 'requests',                   COUNT(*) FROM public.requests       WHERE id::text LIKE 'c0000000%';
