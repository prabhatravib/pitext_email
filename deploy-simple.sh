#!/bin/bash

# Deploy script for PiText Email
set -e

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build frontend
echo "🔨 Building frontend..."
cd apps/mail
echo "📁 Current directory: $(pwd)"
echo "📄 Available files: $(ls -la)"

# Run the build with verbose output
echo "🔨 Running build:simple-fallback..."
pnpm run build:simple-fallback

# Verify build output
echo "🔍 Verifying build output..."
if [ -d "build/client" ]; then
    echo "✅ Build directory exists"
    echo "📄 Files in build: $(ls -la build/client/)"
    
    if [ -f "build/client/index.html" ]; then
        echo "✅ index.html exists"
    else
        echo "❌ index.html missing"
        exit 1
    fi
else
    echo "❌ Build directory not found"
    exit 1
fi

cd ../..

# Start the server
echo "🚀 Starting server..."
pnpm run start:simple 