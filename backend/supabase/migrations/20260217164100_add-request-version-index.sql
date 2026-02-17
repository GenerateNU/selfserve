-- descending because grabbing most recent version means more recent dates will be grabbed
-- more often than lower dates
CREATE INDEX IF NOT EXISTS idx_requests_id_version_desc
ON public.requests(id, request_version DESC);
