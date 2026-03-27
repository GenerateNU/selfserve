-- index on guest_bookings for hotel_id and status
create index if not exists idx_guest_bookings_hotel_id_status
  on public.guest_bookings(hotel_id, status);
