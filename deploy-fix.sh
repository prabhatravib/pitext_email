#!/bin/bash

echo "🚀 Deploying PiText Email with fixes..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Building and deploying to Render..."

# The deployment will be triggered automatically by Render
# when you push to the main branch

echo "✅ Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push your changes to trigger deployment"
echo "2. Monitor the build logs in Render dashboard"
echo "3. Check the application at https://pitext-email.onrender.com"
echo ""
echo "🔍 To check deployment status:"
echo "   - Visit: https://dashboard.render.com/web/pitext-email"
echo "   - Check the 'Events' tab for build logs"
echo ""
echo "🛠️ If the build still fails, check:"
echo "   - Environment variables in Render dashboard"
echo "   - Build logs for specific error messages"
echo "   - Ensure all dependencies are properly installed" 