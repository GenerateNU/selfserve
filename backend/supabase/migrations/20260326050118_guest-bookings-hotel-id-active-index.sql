-- Partial index on guest_bookings for active bookings by hotel"
create index if not exists idx_guest_bookings_hotel_id_active
  on public.guest_bookings(hotel_id)
  where status = 'active';
