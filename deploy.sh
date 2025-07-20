#!/bin/bash

# Deployment script for PiText Mail App
# This script ensures the build process works correctly for Render deployment

set -e

echo "🚀 Starting PiText Mail App deployment..."

# Check if we're in the right directory
if [ ! -f "email_app.py" ]; then
    echo "❌ Error: email_app.py not found. Please run this script from the pitext_mail directory."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building mail app..."
cd apps/mail
pnpm build

# Check if build was successful
if [ ! -d "build/client" ]; then
    echo "❌ Build failed! build/client directory not found."
    echo "Available files:"
    ls -la
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build contents:"
ls -la build/client/

cd ../..

echo "🎉 Deployment preparation completed!"
echo "The mail app is now ready to be served by email_app.py" 