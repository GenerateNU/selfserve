-- Create index on users table for employee_id
create index if not exists idx_users_employee_id on public.users(employee_id);