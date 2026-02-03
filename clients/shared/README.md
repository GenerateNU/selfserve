# Shared Package

This package contains shared code (API clients, hooks, types, utilities) used by both the web and mobile clients.

## Architecture

- **Source-only package**: This is not a compiled npm package. Web and mobile import the raw TypeScript source and bundle it with their own dependencies.
- **DevDependencies for type checking**: React and TanStack Query are installed as `devDependencies` to enable TypeScript type checking.
- **Peer dependencies**: The consuming apps (web/mobile) provide `react` and `@tanstack/react-query` at runtime.
- **Bundler configuration**: Both Metro (mobile) and Vite (web) are configured to:
  - Resolve dependencies from the consuming app's `node_modules`
  - Block the shared package's `node_modules` from being bundled (prevents duplicate React)

## Setup

### First Time Setup

```bash
cd clients/shared
npm install --legacy-peer-deps
npm run generate:api
```

**Important**: Use `--legacy-peer-deps` to prevent npm from auto-installing peer dependencies.

### Important Notes

1. **Type checking**: Run `tsc --noEmit` from web or mobile directories, not from shared.

2. **Environment variables**: The shared package uses `process.env.API_BASE_URL` which is injected by:
   - **Web**: Vite's `define` config in `vite.config.ts`
   - **Mobile**: Metro bundler

## API Type Generation (Orval)

This package uses [Orval](https://orval.dev/) to automatically generate TypeScript types and API client functions from the backend's OpenAPI specification.

### Generating API Types

After making changes to the backend API (or when setting up for the first time):

```bash
# Generate types from the OpenAPI spec
npm run generate:api

# Or use watch mode during development
npm run generate:api:watch
```

### Generated Files

Generated files are located in `src/api/generated/` (gitignored):

- `models/` - TypeScript interfaces for all API models
- `endpoints/` - API client functions organized by tag (hello, users, hotels, requests, etc.)

### Usage

Import generated types and functions in your code:

```typescript
// Import API functions directly from the shared package
import { getHello, getHelloName, getRequests, postRequest } from "@shared";

// Import types
import type {
  Request,
  MakeRequest,
  User,
  CreateUser,
  Hotel,
  Guest,
} from "@shared";

// Use generated functions - they return { data, status, headers }
const helloResponse = await getHello();
console.log(helloResponse.data); // "Yogurt. Gurt: Yo!"
console.log(helloResponse.status); // 200

const requestsResponse = await getRequests();
const allRequests = requestsResponse.data; // Request[]

// In React Query hooks, extract .data in the queryFn
import { useQuery } from "@tanstack/react-query";

const { data: message } = useQuery({
  queryKey: ["hello"],
  queryFn: async () => {
    const response = await getHello();
    return response.data; // Extract just the data
  },
});

// Or use the provided hooks that handle data extraction
import { useGetHello, useGetHelloName } from "@shared";

const { data: message } = useGetHello(); // Returns string directly
```

### Backend Changes Workflow

When the backend API changes:

1. Update backend code with Swagger annotations
2. Run `make swagger` in the backend directory
3. Run `npm run generate:api` in the shared package
4. Types automatically sync to frontend

### CI/CD

The CI workflows automatically generate types before building:

1. Backend CI generates `swagger.yaml`
2. Frontend CI runs `npm run generate:api` before type checking and building
3. Type mismatches are caught at build time

## How It Works

### Development

- Web/mobile import from `@shared/*` (aliased to `../shared/src/*`)
- Their bundlers compile the TypeScript source
- Dependencies resolve from web/mobile's `node_modules`
- Result: Single React instance, no duplicates

### Production (Vercel/EAS)

- Same as development
- The bundler includes shared source code in the final bundle
- All dependencies come from the consuming app
