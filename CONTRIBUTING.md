# Contributing

## Local Setup

### Docker

To run the backend via Docker, the container fetches secrets directly from Doppler at startup using a service token.

Generate a token and export it in your shell:

```bash
eval $(make docker-token)
```

Then start the stack:

```bash
make docker-up
```

You'll need to re-run `eval $(make docker-token)` in any new shell session, or add `DOPPLER_TOKEN` to your shell profile.

### OpenSearch

Run OpenSearch locally with the security plugin disabled (no TLS or auth required for local dev):

```bash
docker run -d --name opensearch \
  -p 9200:9200 -p 9600:9600 \
  -e "discovery.type=single-node" \
  -e "DISABLE_SECURITY_PLUGIN=true" \
  opensearchproject/opensearch:latest
```

Verify it's running:

```bash
curl http://localhost:9200
```

> In production, OpenSearch uses TLS and credentials injected via Doppler. `OPENSEARCH_INSECURE_SKIP_TLS` should be `false` in prod.
