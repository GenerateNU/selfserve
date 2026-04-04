# Contributing

## Local Setup

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
