ALTER TABLE public.requests DROP CONSTRAINT requests_pkey;

ALTER TABLE public.requests ADD CONSTRAINT requests_pkey PRIMARY KEY (id, request_version);
