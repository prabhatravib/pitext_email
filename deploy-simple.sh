#!/bin/bash

echo "🚀 Deploying PiText Email (Simple Mode)"

# Build the frontend first
echo "📦 Building frontend..."
cd apps/mail
pnpm run build
cd ../..

# Start the server
echo "🔧 Starting server..."
cd apps/server
pnpm run start:simple 