#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting build process..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/
rm -rf release/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile TypeScript with stricter settings and JSX support
echo "🔨 Compiling TypeScript..."
npx tsc --project tsconfig.json

# Bundle with esbuild
echo "📦 Bundling with esbuild..."
npx esbuild src/main.ts \
  --bundle \
  --platform=node \
  --target=node14 \
  --outfile=dist/main.js \
  --external:electron \
  --external:keytar \
  --external:openai \
  --define:process.env.NODE_ENV=\"production\" \
  --sourcemap \
  --jsx=automatic

# Add type checking
echo "🔍 Type checking..."
npx tsc --noEmit --pretty

# Install Native Modules for Electron
echo "🔌 Rebuilding native modules..."
npx electron-rebuild

# ... rest of build script ... 