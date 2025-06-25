#!/bin/bash

# Test script for create-turbo-sanity CLI package
set -e

echo "🧪 Running Create Turbo Sanity Tests"
echo "====================================="

# Navigate to CLI package
cd "$(dirname "$0")"
echo "📂 Working directory: $(pwd)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

echo "🔍 Running unit tests..."
pnpm test

echo "🔧 Running linting..."
pnpm lint

echo "✅ All tests passed!"
echo ""
echo "🚀 To test the CLI manually:"
echo "   pnpm link --global"
echo "   cd /tmp"
echo "   pnpm create turbo-sanity test-project"
