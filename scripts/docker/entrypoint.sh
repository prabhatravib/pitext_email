#!/bin/sh
set -x

# Debug: Check if build files exist
echo "🔍 Checking build files in container..."
echo "🔍 Current working directory: $(pwd)"
echo "🔍 Files in current directory:"
ls -la

echo "🔍 Checking apps directory..."
ls -la apps/ || (echo "❌ CRITICAL ERROR: Apps directory not found" && exit 1)

echo "🔍 Checking mail app..."
ls -la apps/mail/ || (echo "❌ CRITICAL ERROR: Mail app not found" && exit 1)

echo "🔍 Checking build directory..."
ls -la apps/mail/build/ || (echo "❌ BUILD ERROR: Build directory not found" && exit 1)

echo "🔍 Checking client directory..."
ls -la apps/mail/build/client/ || (echo "❌ BUILD ERROR: Client directory not found" && exit 1)

echo "🔍 Checking index.html..."
ls -la apps/mail/build/client/index.html || (echo "❌ BUILD ERROR: index.html not found" && exit 1)

# Check if the server file exists
echo "🔍 Checking server.js..."
ls -la apps/mail/server.js || (echo "❌ CRITICAL ERROR: server.js not found" && exit 1)

# Check if fallback file exists
echo "🔍 Checking fallback-index.html..."
ls -la apps/mail/fallback-index.html || echo "⚠️ Fallback file not found, but continuing..."

# Set environment variables for production
export NODE_ENV=production
export PORT=10000
export HOSTNAME="0.0.0.0"

echo "🚀 Starting mail server on port $PORT..."

# Start the mail server (which serves the frontend)
exec node /app/apps/mail/server.js