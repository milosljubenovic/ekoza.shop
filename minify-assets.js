#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const jsFiles = [
  { src: 'assets/js/anti-debug.js', dest: '_site/assets/js/anti-debug.js' },
  { src: 'assets/js/cart.js', dest: '_site/assets/js/cart.js' },
  { src: 'assets/js/main.js', dest: '_site/assets/js/main.js' },
  { src: 'assets/js/checkout.js', dest: '_site/assets/js/checkout.js' }
];

async function minifyFile(src, dest) {
  try {
    if (!fs.existsSync(src)) {
      console.log(`⚠️  Skipping ${src} (file not found)`);
      return;
    }

    const code = fs.readFileSync(src, 'utf8');
    const result = await minify(code, {
      compress: {
        dead_code: true,
        drop_console: true, // Remove console.log statements
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/ // Mangle properties starting with underscore
        }
      },
      format: {
        comments: false // Remove all comments
      }
    });

    // Ensure destination directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(dest, result.code);
    
    const originalSize = Buffer.byteLength(code, 'utf8');
    const minifiedSize = Buffer.byteLength(result.code, 'utf8');
    const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${src} → ${dest} (${reduction}% smaller)`);
  } catch (error) {
    console.error(`❌ Error minifying ${src}:`, error.message);
  }
}

async function minifyAll() {
  console.log('🔧 Starting JavaScript minification and obfuscation...\n');
  
  for (const file of jsFiles) {
    await minifyFile(file.src, file.dest);
  }
  
  console.log('\n✨ Minification complete!');
}

minifyAll();
