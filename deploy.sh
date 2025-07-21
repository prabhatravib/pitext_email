#!/bin/bash

# Deployment script for PiText Email
set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build frontend
echo "🔨 Building frontend..."
pnpm run build:frontend

# Check if build was successful
if [ ! -f "apps/mail/build/client/index.html" ]; then
    echo "❌ Error: Frontend build failed. index.html not found."
    exit 1
fi

echo "✅ Frontend build completed successfully!"

# Build backend (if needed)
echo "🔨 Building backend..."
pnpm run build:backend

echo "✅ Backend build completed successfully!"

# Check if server files exist
if [ ! -f "apps/server/src/main.ts" ]; then
    echo "❌ Error: Backend server file not found."
    exit 1
fi

echo "🎉 All builds completed successfully!"
echo "📋 Next steps:"
echo "   1. Commit your changes: git add . && git commit -m 'Deploy fixes'"
echo "   2. Push to trigger Render deployment: git push"
echo "   3. Monitor deployment at: https://dashboard.render.com" 