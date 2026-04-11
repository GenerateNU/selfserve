ALTER TABLE public.departments
    ADD CONSTRAINT departments_hotel_id_name_unique UNIQUE (hotel_id, name);

CREATE TABLE IF NOT EXISTS public.employee_departments (
    employee_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, department_id)
);

CREATE INDEX idx_employee_departments_employee_id ON public.employee_departments (employee_id);
CREATE INDEX idx_employee_departments_department_id ON public.employee_departments (department_id);
