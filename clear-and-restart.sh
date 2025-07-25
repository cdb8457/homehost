#!/bin/bash

echo "🔧 Clearing Next.js Cache and Restarting..."

cd "/mnt/host/c/NewProject Fresh/apps/web-dashboard"

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "next dev" 2>/dev/null || true

# Clear all cache directories
echo "🗑️ Clearing cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .cache

# Clear any potential lock files
rm -f package-lock.json

echo "📦 Reinstalling dependencies..."
npm install

echo "🚀 Starting fresh development server..."
npm run dev