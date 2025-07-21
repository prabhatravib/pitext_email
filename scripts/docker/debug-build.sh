#!/bin/bash
set -e

echo "🔍 Debugging build process..."

# Check current directory
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Check if we're in the right place
if [ -f "package.json" ]; then
    echo "✅ Found package.json"
else
    echo "❌ No package.json found"
    exit 1
fi

# Check if apps/mail exists
if [ -d "apps/mail" ]; then
    echo "✅ Found apps/mail directory"
    echo "Files in apps/mail:"
    ls -la apps/mail/
else
    echo "❌ apps/mail directory not found"
    exit 1
fi

# Check required files in apps/mail
cd apps/mail

echo "Checking required files in apps/mail..."
echo "index.html exists: $(test -f index.html && echo 'yes' || echo 'no')"
echo "vite.client.config.ts exists: $(test -f vite.client.config.ts && echo 'yes' || echo 'no')"
echo "build-client-only.js exists: $(test -f build-client-only.js && echo 'yes' || echo 'no')"
echo "package.json exists: $(test -f package.json && echo 'yes' || echo 'no')"

# Check Node.js and pnpm versions
echo "Node version: $(node --version)"
echo "PNPM version: $(pnpm --version)"

# Try to run the build
echo "Attempting to run build..."
pnpm run build

# Check if build was successful
if [ -d "build/client" ]; then
    echo "✅ Build directory created"
    echo "Files in build/client:"
    ls -la build/client/
    
    if [ -f "build/client/index.html" ]; then
        echo "✅ index.html found"
        echo "index.html content (first 5 lines):"
        head -5 build/client/index.html
    else
        echo "❌ index.html not found"
    fi
else
    echo "❌ Build directory not created"
fi

echo "🔍 Debug complete" 