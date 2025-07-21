#!/bin/sh
set -x

# Debug: Check if build files exist
echo "🔍 Checking build files in container..."
ls -la /app/apps/mail/
echo "🔍 Checking build directory..."
ls -la /app/apps/mail/build/ || echo "❌ Build directory not found"
echo "🔍 Checking client directory..."
ls -la /app/apps/mail/build/client/ || echo "❌ Client directory not found"
echo "🔍 Checking index.html..."
ls -la /app/apps/mail/build/client/index.html || echo "❌ index.html not found"

# Start the server directly
exec node /app/apps/mail/server.js