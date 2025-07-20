# PiText Email - Gmail Import Deployment Guide

## 🎯 Goal: Get Gmail Import Working

This guide focuses on deploying PiText Email with working Gmail import functionality.

## 📋 Prerequisites

### 1. Google Cloud Console Setup (Required for Gmail Import)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Required APIs**
   - Go to "APIs and Services" > "Library"
   - Enable these APIs:
     - [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
     - [People API](https://console.cloud.google.com/apis/library/people.googleapis.com)
     - [Google OAuth2 API](https://console.cloud.google.com/apis/library/oauth2.googleapis.com)

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs and Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add Authorized Redirect URIs:
     - Development: `http://localhost:8787/api/auth/callback/google`
     - Production: `https://your-backend-url.onrender.com/api/auth/callback/google`
   - Save your Client ID and Client Secret

4. **Add Test Users** (if in testing mode)
   - Go to "OAuth consent screen"
   - Add your email as a test user

### 2. Environment Variables Setup

Create a `.env` file in the root directory with:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zerodotemail

# Google OAuth (Required for Gmail Import)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Better Auth
BETTER_AUTH_SECRET=your_random_secret_key
BETTER_AUTH_URL=https://your-backend-url.onrender.com

# App URLs
VITE_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
VITE_PUBLIC_APP_URL=https://your-frontend-url.onrender.com

# Other required variables
NODE_ENV=production
COOKIE_DOMAIN=your-domain.com
```

## 🚀 Deployment Steps

### 1. Update Render Configuration

The `render.yaml` file is already configured correctly for:
- Backend service: `pitext-email-backend`
- Frontend service: `pitext-email`

### 2. Deploy to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment for Gmail import"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` and create both services

3. **Set Environment Variables in Render**
   - Go to your backend service settings
   - Add all environment variables from the `.env` file above
   - Make sure to use your actual Google OAuth credentials

### 3. Test Gmail Import

1. **Access Your App**
   - Go to your frontend URL: `https://pitext-email.onrender.com`

2. **Add Gmail Connection**
   - Click "Get Started" or "Sign In"
   - Choose "Google" to connect your Gmail account
   - Authorize the app to access your Gmail

3. **Verify Import**
   - After authorization, you should see your Gmail emails in the inbox
   - Check that emails are loading properly

## 🔧 Troubleshooting

### Common Issues

1. **"Cannot GET /" Error**
   - Check that the frontend build completed successfully
   - Verify the `startCommand` in render.yaml is correct

2. **502 Backend Error**
   - Check backend logs in Render dashboard
   - Verify environment variables are set correctly
   - Ensure Google OAuth credentials are valid

3. **Gmail Import Not Working**
   - Verify Google OAuth credentials are correct
   - Check that all required Google APIs are enabled
   - Ensure redirect URIs match exactly

4. **Build Failures**
   - Check that all dependencies are installed
   - Verify Node.js version compatibility
   - Check for TypeScript compilation errors

### Debug Commands

```bash
# Test build locally
pnpm install
pnpm run build:frontend
pnpm run build:backend

# Test servers locally
pnpm run start:frontend
pnpm run start:simple
```

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables are set correctly
3. Test Google OAuth flow locally first
4. Ensure all required Google APIs are enabled

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Frontend loads at `https://pitext-email.onrender.com`
- ✅ Backend responds at `https://pitext-email-backend.onrender.com`
- ✅ You can sign in with Google
- ✅ Gmail emails are imported and displayed
- ✅ You can read, compose, and manage emails 