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

### After Pulling Changes

```bash
cd clients/shared
npm install --legacy-peer-deps
```

### Key Files

- **`.npmrc`**: Contains `auto-install-peers=false` (optional, but recommended for clarity)
- **`node_modules/`**: Gitignored - only used for local TypeScript type checking
- **`package-lock.json`**: Gitignored - not needed in repo

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
- Result: Optimized bundle with no duplicate dependencies

## Troubleshooting

### "Invalid hook call" error in mobile

This means React is duplicated. Fix:

```bash
cd clients/shared
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
cd ../mobile
rm -rf /tmp/metro-* /tmp/haste-*
npx expo start --clear
```

### TypeScript errors about missing modules

Make sure shared's devDependencies are installed:

```bash
cd clients/shared
npm install --legacy-peer-deps
```

### Web app can't connect to backend (404 errors)

1. Check that `.env` file exists in `clients/web/` with `VITE_API_BASE_URL=http://localhost:8080`
2. Restart the web dev server to pick up env changes
3. Verify `vite.config.ts` has the `define` config with `loadEnv`

### Mobile app can't connect to backend

1. Check that `.env` file exists in `clients/mobile/` with `VITE_API_BASE_URL=http://localhost:8080` (or `http://10.0.2.2:8080` for Android emulator)
2. Restart Metro with `npx expo start --clear`
3. Verify `metro.config.js` has `react-native-dotenv` configured

### Web/mobile can't find shared imports

Check that the path aliases are configured:

- **Web**: `vite.config.ts` has `alias: { '@shared': path.resolve(__dirname, '../shared/src') }`
- **Mobile**: `metro.config.js` has `extraNodeModules: { '@shared': path.resolve(__dirname, '../shared/src') }`
