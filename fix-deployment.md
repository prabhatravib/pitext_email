# 🚀 PiText Email - Single Service Deployment Guide

## 🎯 What We're Building

A single service deployment that:
- Serves the email client frontend
- Provides a simple JSON-based backend for demo
- Can be upgraded later to support Gmail import

## 🔧 Quick Fix Steps

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix deployment for single service with built-in backend"
git push origin main
```

### 2. Deploy to Render

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. If you have multiple services, DELETE the backend service (keep only `pitext-email`)
3. For the `pitext-email` service:
   - Click on it
   - Go to "Settings" → "Build & Deploy"
   - Set the **Build Command** to: `cd apps/mail && pnpm run build && cd ../server`
   - Set the **Start Command** to: `pnpm run start:simple`
   - Click "Clear build cache & deploy"

### 3. Set Environment Variables

While it's building, add these environment variables to your `pitext-email` service:

```env
NODE_ENV=production
PORT=10000
VITE_PUBLIC_APP_URL=https://pitext-email.onrender.com
VITE_PUBLIC_BACKEND_URL=https://pitext-email.onrender.com
BETTER_AUTH_URL=https://pitext-email.onrender.com
BETTER_AUTH_SECRET=<generate-random-32-char-string>
CORS_ORIGIN=https://pitext-email.onrender.com
```

To generate a random secret:
```bash
openssl rand -base64 32
```

### 4. Verify Deployment

After deployment (takes 5-10 minutes):

1. Check health endpoint: https://pitext-email.onrender.com/health
   - Should return: `{"status":"ok","message":"PiText Email is running"}`

2. Visit your app: https://pitext-email.onrender.com
   - You should see the email client interface
   - A welcome email will be in the inbox

## 📧 How It Works

This deployment uses:
- **Single Service**: Everything runs from one Render service
- **Built-in Backend**: Simple JSON file storage for demo emails
- **No Database Required**: Data stored in local JSON files
- **Demo Mode**: Works immediately without Gmail setup

## 🔧 Adding Gmail Import (Optional)

Once the basic deployment works:

### 1. Set Up Google Cloud
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable these APIs:
   - Gmail API
   - Google OAuth2 API

### 2. Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Create "OAuth 2.0 Client ID" (Web application)
3. Add authorized redirect URI:
   ```
   https://pitext-email.onrender.com/api/auth/callback/google
   ```

### 3. Add to Render Environment
Add these variables to your Render service:
```env
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

## 🐛 Troubleshooting

### "Cannot GET /" Error
- Build is still in progress (wait 5-10 minutes)
- Check Render logs for build errors

### Virus Detection (Windows)
This is a false positive. Solutions:
- Deploy from GitHub (recommended)
- Add project to Windows Defender exclusions
- Use WSL for development

### Build Failures
Check Render logs for:
- Missing dependencies
- TypeScript errors
- Build script issues

## ✅ Success Checklist

- [ ] Service shows "Live" in Render
- [ ] Health check returns OK
- [ ] Email client loads in browser
- [ ] Welcome email appears in inbox
- [ ] Can read/compose emails

## 📝 What This Deployment Includes

1. **All-in-One Server** (`all-in-one-server.js`):
   - Serves frontend build files
   - Provides simple API endpoints
   - Manages demo email data

2. **Demo Features**:
   - Read emails
   - Compose new emails
   - Star/unstar messages
   - Move between folders
   - Search functionality

3. **Data Storage**:
   - Emails stored in `/data` folder
   - Persists between restarts
   - No external database needed

## 🚀 Next Steps

1. **Test the deployment**: https://pitext-email.onrender.com
2. **Explore the demo**: Try all email features
3. **Set up Gmail** (optional): Follow the OAuth steps above
4. **Customize**: Modify the UI or add features

Your email client is now deployed! 🎉 