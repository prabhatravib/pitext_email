# Email App Setup for PiText Router (DISABLED)

## Overview
The email app (`pitext_mail`) was previously integrated into the PiText router as a static bundle, but has been disabled due to JavaScript runtime errors. The email functionality is currently not available.

## Configuration (DISABLED)

### 1. Vite Configuration
The email app's Vite config (`pitext_mail/apps/mail/vite.config.ts`) was configured with:
- `base: "/email/"` - Sets the path prefix for all assets
- `outDir: "../../../router-backend/static/email"` - Builds to the router's static directory
- `emptyOutDir: true` - Cleans the output directory before each build

### 2. Build Script
Previously added to `pitext_mail/package.json`:
```json
"mail:build:static": "pnpm --filter @zero/mail build"
```

### 3. Router Integration
The router (`router-backend/router_app.py`) previously:
- Mounted static files from `/email` to serve the email app
- Included fallback error handling if the app isn't built yet
- Logged successful mounting with: `✓ Email app mounted at /email (Static Files)`

**Note: This functionality has been disabled due to JavaScript runtime errors.**

## Build Process (DISABLED)

### Local Development
1. Navigate to the mail app directory:
   ```bash
   cd pitext_mail
   ```

2. Install dependencies (if not already done):
   ```bash
   pnpm install
   ```

3. Build the static files:
   ```bash
   pnpm mail:build:static
   ```

### CI/CD Integration
Add to your build pipeline:
```bash
# After installing dependencies
pnpm mail:build:static
```

### Render Deployment
Update your Render build command to include:
```bash
pnpm build:desktop && pnpm build:calendar && pnpm mail:build:static
```

**Note: These build steps are currently disabled due to JavaScript runtime errors.**

## File Structure (DISABLED)
```
router-backend/
├── static/
│   └── email/          # Built email app files (REMOVED)
│       ├── index.html
│       ├── assets/
│       └── ...
└── router_app.py       # Router with email mount (DISABLED)
```

## Testing (DISABLED)
1. Start the router:
   ```bash
   cd router-backend
   python -m uvicorn router_app:app --host 0.0.0.0 --port 8000
   ```

2. Access the email app at: `http://localhost:8000/email/` (Returns 404)

**Note: The email app is currently disabled and will return 404 errors.**

## Troubleshooting (DISABLED)

### Email app not loading
- The email app is currently disabled due to JavaScript runtime errors
- Any attempts to access `/email/` will return 404

### Build errors
- Build process has been disabled
- No email app building is currently supported

### Static files not serving
- The email static files have been removed
- The router returns 404 for all `/email/` routes

## Notes (DISABLED)
- The email app was using React Router, but is currently disabled
- Assets were served with the `/email/` prefix as configured in Vite
- The router now returns 404 responses for all email routes 