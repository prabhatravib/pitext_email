# Email App Deployment Guide

This guide explains how to deploy the email app so it works at `pitext.onrender.com/email` through the Python router.

## Overview

The email app is a React application that needs to be built and served as static files. We've created a Python FastAPI wrapper that serves these static files, allowing it to be mounted in the router.

## Prerequisites

1. **Node.js and pnpm** installed on your system
2. **Python** with FastAPI dependencies
3. **Git** access to the repository

## Step 1: Build the Mail App

Run the build script to compile the React mail app:

```bash
cd router-backend
python build_email.py
```

This will:
- Install dependencies in `pitext_mail/`
- Build the React app to `pitext_mail/apps/mail/build/client/`
- Verify the build was successful

## Step 2: Deploy to Render

The router will now automatically serve the email app at `/email` when deployed to Render.

### Render Configuration

Make sure your `render.yaml` includes the build step:

```yaml
services:
  - type: web
    name: pitext-router
    env: python
    buildCommand: |
      pip install -r requirements.txt
      cd router-backend && python build_email.py
    startCommand: cd router-backend && python router_app.py
```

## Step 3: Verify Deployment

After deployment, you should be able to access:
- `https://pitext.onrender.com/email` - The mail app
- `https://pitext.onrender.com/desktop` - Desktop app
- `https://pitext.onrender.com/mobile` - Mobile app
- `https://pitext.onrender.com/calendar` - Calendar app

## Troubleshooting

### Build Fails
If the build fails, check:
1. Node.js and pnpm are installed
2. The `pitext_mail` directory exists
3. All dependencies are available

### Email App Not Loading
If the email app shows "not built" message:
1. Check that `pitext_mail/apps/mail/build/client/` exists
2. Re-run the build script
3. Check the router logs for errors

### Static Files Not Found
If static files aren't loading:
1. Verify the build path in `email_app.py`
2. Check that the build directory contains `index.html`
3. Ensure the router is mounting the email app correctly

## Development

For local development:

```bash
# Build the mail app
cd router-backend
python build_email.py

# Run the router locally
python router_app.py
```

Then visit `http://localhost:8000/email` to see the mail app.

## Architecture

```
pitext_mail/apps/mail/          # React source code
├── build/client/               # Built static files (generated)
│   ├── index.html
│   ├── assets/
│   └── ...

router-backend/
├── email_app.py               # FastAPI wrapper for static files
├── router_app.py              # Main router
└── build_email.py             # Build script
```

The email app is served as static files through a Python FastAPI wrapper, allowing it to be integrated with the existing router architecture. 