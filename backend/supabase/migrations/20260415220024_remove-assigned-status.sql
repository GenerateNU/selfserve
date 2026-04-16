-- Migrate requests with 'assigned' status to 'pending'
update public.requests
set status = 'pending'
where status = 'assigned';
