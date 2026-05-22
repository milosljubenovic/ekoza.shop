#!/bin/bash

# Start script for Lazy Pleasure Jekyll store

echo "🚀 Starting Lazy Pleasure eCommerce Store..."
echo ""

# Load NVM
export NVM_DIR="/usr/local/share/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Build CSS
echo "🎨 Building Tailwind CSS..."
npm run build:css

# Start Jekyll server
echo "🌐 Starting Jekyll server..."
echo "📍 Store will be available at: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

bundle exec jekyll serve --livereload --host 0.0.0.0
