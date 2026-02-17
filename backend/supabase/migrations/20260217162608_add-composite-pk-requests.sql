ALTER TABLE public.requests
DROP CONSTRAINT requests_pkey;

ALTER TABLE public.requests
ADD PRIMARY KEY (id, request_version);
