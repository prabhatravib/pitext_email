#!/bin/bash
set -e

echo "🔨 Building Docker image..."
docker build -f docker/app/Dockerfile -t pitext-email:test .

echo "🧪 Testing Docker container..."
docker run --rm -p 10000:10000 pitext-email:test &

echo "⏳ Waiting for container to start..."
sleep 10

echo "🔍 Testing application..."
curl -f http://localhost:10000/health || echo "❌ Health check failed"
curl -f http://localhost:10000/ || echo "❌ Main page failed"

echo "🧹 Cleaning up..."
docker stop $(docker ps -q --filter ancestor=pitext-email:test) 2>/dev/null || true

echo "✅ Test completed" 