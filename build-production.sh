#!/bin/bash

echo "🚀 Building production site with minification..."

# Set production environment
export JEKYLL_ENV=production

# Build CSS (minified)
echo "📦 Building and minifying CSS..."
npm run build:css

# Build Jekyll site (HTML will be minified by plugin)
echo "🏗️  Building Jekyll site..."
CONFIG="_config.yml"
if [ -f "_config.local.yml" ]; then
    CONFIG="_config.yml,_config.local.yml"
fi
bundle exec jekyll build --config "$CONFIG"

# Minify and obfuscate JavaScript
echo "🔒 Minifying and obfuscating JavaScript..."
npm run minify:js

echo "✅ Production build complete!"
echo ""
echo "📊 Site is ready in _site/ directory"
echo "To deploy to GitHub Pages:"
echo "  git add ."
echo "  git commit -m 'Build: Production build with minification'"
echo "  git push origin main"
