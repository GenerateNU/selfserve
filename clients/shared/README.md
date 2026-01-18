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
```

**Important**: Use `--legacy-peer-deps` to prevent npm from auto-installing peer dependencies.

### Important Notes

1. **Type checking**: Run `tsc --noEmit` from web or mobile directories, not from shared.

2. **Environment variables**: The shared package uses `process.env.VITE_API_BASE_URL` which is injected by:
   - **Web**: Vite's `define` config in `vite.config.ts`
   - **Mobile**: Metro with `react-native-dotenv` in `metro.config.js`

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
