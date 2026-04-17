# SelfServe Prod

## Backend: https://selfserve-production.up.railway.app/

![Repobeats analytics](https://repobeats.axiom.co/api/embed/a87cdebacff1d8354221554cbf2baca35800352c.svg "Repobeats analytics image")

## Environment Setup with Doppler

This project uses [Doppler](https://doppler.com) for centralized secrets management across 3 projects:

- **selfserve-backend** - Go backend secrets (DB, Clerk, AWS S3, etc.)
- **selfserve-web** - React web app secrets (API URL, Clerk keys, etc.)
- **selfserve-mobile** - React Native mobile app secrets (API URL, etc.)

Each project has 3 configs: `dev`, `tst`, `prd`

### First-time Setup

1. **Install Doppler CLI**:

   ```bash
   brew install dopplerhq/cli/doppler
   ```

2. **Authenticate** (one-time per machine):

   ```bash
   doppler login
   ```

   This will open your browser to authenticate with Doppler.

3. **Setup each project** (run in respective directories):

   ```bash
   # Backend
   cd backend
   doppler setup
   # Auto selected project: selfserve-backend
   # Auto selected config: dev

   # Web
   cd clients/web
   doppler setup
   # Auto selected project: selfserve-web
   # Auto selected config: dev

   # Mobile
   cd clients/mobile
   doppler setup
   # Auto selected project: selfserve-mobile
   # Auto selected config: dev
   ```

### Running Apps

```bash
# Backend
cd backend
make air          # Hot reload
make test
# Or: make run    # Direct run
# Or: make dev    # Build then run

# Web
cd clients/web
npm run dev       # Start dev server

# Mobile
cd clients/mobile
npm run start     # Start Expo
```

### Managing Secrets

**Via Web UI**:

- Visit [Doppler Dashboard](https://dashboard.doppler.com/)
- Select your project (backend/web/mobile)
- Add/edit secrets in the `dev` config

**Via CLI**:

```bash
# View all secrets for current project
doppler secrets

# Set a secret
doppler secrets set SECRET_NAME=value

# Download secrets to .env format (for reference)
doppler secrets download --no-file --format env
```
