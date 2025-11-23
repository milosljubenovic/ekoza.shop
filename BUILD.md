# Build & Deployment Guide

## Production Build Features

This site includes production build optimizations:

### ✅ **CSS Minification**
- Tailwind CSS is minified automatically
- Unused styles are purged
- File size reduced by ~90%

### ✅ **JavaScript Minification & Obfuscation**
- All JavaScript files are minified using Terser
- Variable names are mangled (shortened)
- `console.log` statements removed
- Debugger statements removed
- Comments stripped
- File size reduced by 30-45%

### ✅ **HTML Minification**
- Removes comments and extra whitespace
- Only in production builds
- Reduces file size by ~20%

## 🚀 Building for Production

### Option 1: Quick Build Script
```bash
./build-production.sh
```

### Option 2: Manual Commands
```bash
# Set production environment
export JEKYLL_ENV=production

# Build CSS (minified)
npm run build:css

# Build Jekyll site (HTML minified)
bundle exec jekyll build

# Minify JavaScript
npm run minify:js
```

### Option 3: Single NPM Command
```bash
npm run build
```

## 📦 Deployment

### GitHub Pages (Automatic)
The `.github/workflows/deploy.yml` workflow automatically:
1. Builds with minification on every push to `main`
2. Deploys to GitHub Pages
3. No manual steps required!

### Manual Deployment
```bash
# Build production site
./build-production.sh

# Commit and push
git add .
git commit -m "Production build"
git push origin main
```

## 🔒 Security Features

### JavaScript Protection
- **Obfuscation**: Variable names are shortened to make code harder to read
- **No Console Logs**: All debug statements removed
- **Debugger Removal**: Debugger statements stripped
- **Minification**: Code is compressed on one line

### What Users Will See
- Minified, hard-to-read JavaScript (single line)
- No comments or helpful variable names
- Debugging is significantly harder (but not impossible)

**Note**: This is not encryption. Determined users can still reverse engineer the code, but it makes casual inspection much more difficult.

## 🛠️ Development vs Production

### Development (Local)
```bash
npm run dev
# OR
bundle exec jekyll serve --livereload
```
- Unminified CSS/JS
- Comments preserved
- Readable code for debugging
- Live reload enabled

### Production (Deployment)
```bash
npm run build
# OR
./build-production.sh
```
- Minified everything
- No comments
- Optimized for performance
- HTML compression enabled

## 📊 File Size Comparison

Typical reduction:
- **CSS**: 150KB → 15KB (90% reduction)
- **JavaScript**: 50KB → 30KB (40% reduction)
- **HTML**: 20KB → 16KB (20% reduction)

## 🔧 Configuration

### Disable HTML Minification
Edit `_plugins/html_compressor.rb` - set options to `false`

### Disable JS Obfuscation
Edit `minify-assets.js` - remove `mangle` options

### Add More JS Files
Edit `minify-assets.js` - add to `jsFiles` array

## 📝 Notes

- Minification only runs in production (`JEKYLL_ENV=production`)
- Local development remains unaffected
- GitHub Actions automatically builds with minification
- Original source files are never modified (only `_site/` outputs)
