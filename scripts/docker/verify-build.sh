#!/bin/sh
set -x

echo "🔍 Verifying build process in Docker container..."

# Check current directory and files
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Check if we're in the right location
if [ -d "apps/mail" ]; then
    echo "✅ Found apps/mail directory"
    cd apps/mail
else
    echo "❌ apps/mail directory not found"
    exit 1
fi

# Check if required files exist
echo "Checking required files..."
echo "index.html exists: $(test -f index.html && echo 'yes' || echo 'no')"
echo "vite.client.config.ts exists: $(test -f vite.client.config.ts && echo 'yes' || echo 'no')"
echo "build-client-only.js exists: $(test -f build-client-only.js && echo 'yes' || echo 'no')"
echo "package.json exists: $(test -f package.json && echo 'yes' || echo 'no')"

# Try to run the build
echo "Running build process..."
pnpm run build

# Check build output
echo "Checking build output..."
echo "Build directory exists: $(test -d build && echo 'yes' || echo 'no')"
echo "Client directory exists: $(test -d build/client && echo 'yes' || echo 'no')"
echo "index.html exists: $(test -f build/client/index.html && echo 'yes' || echo 'no')"

if [ -d "build/client" ]; then
    echo "Build directory contents:"
    ls -la build/client/
fi

echo "✅ Build verification completed" 