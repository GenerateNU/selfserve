CREATE OR REPLACE VIEW public.active_guest_list AS
SELECT
    gb.hotel_id,
    g.id AS guest_id,
    CONCAT_WS(' ', g.first_name, g.last_name) AS government_name,
    COALESCE(g.preferred_name, g.first_name) AS preferred_name,
    r.floor,
    r.room_number,
    COUNT(*) OVER (PARTITION BY gb.hotel_id, gb.room_id) AS group_size
FROM public.guest_bookings gb
JOIN public.guests g
    ON g.id = gb.guest_id
JOIN public.rooms r
    ON r.id = gb.room_id
WHERE gb.status = 'active';
