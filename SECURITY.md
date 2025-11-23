# 🔒 Security & Anti-Debugging Features

## Overview
This site includes multiple layers of protection to prevent debugging, inspection, and unauthorized code access.

---

## 🛡️ Protection Layers

### 1. **Keyboard Shortcuts Disabled**
- **F12** - Blocked
- **Ctrl+Shift+I** - DevTools (Blocked)
- **Ctrl+Shift+J** - Console (Blocked)
- **Ctrl+Shift+C** - Inspect Element (Blocked)
- **Ctrl+U** - View Source (Blocked)
- **Ctrl+S** - Save Page (Blocked)

### 2. **Right-Click Disabled**
- Context menu is completely disabled
- Prevents "Inspect Element" access

### 3. **DevTools Detection**
When DevTools is opened, the page:
- Detects window size changes (DevTools docking)
- Replaces entire page content with warning message
- Monitors window dimensions every 500ms

**Warning Message:**
> "Developer tools nisu dozvoljeni na ovoj stranici."

### 4. **Debugger Traps**
- Continuous `debugger` statements injected every 50ms
- Makes stepping through code nearly impossible
- DevTools performance severely degraded when open

### 5. **Console Disabled**
All console methods are overridden:
- `console.log()` → no output
- `console.debug()` → no output
- `console.warn()` → no output
- `console.info()` → no output
- `console.error()` → no output
- `console.trace()` → no output

### 6. **Text Selection Disabled**
- Users cannot select/copy text from the page
- `document.onselectstart` returns false

### 7. **Console Timing Detection**
- Measures time taken by console operations
- If console is open (timing > 10ms), page is replaced with warning

---

## 🔐 Code Obfuscation

### JavaScript Minification
All JavaScript files are:
- ✅ **Minified** - Single line, no formatting
- ✅ **Obfuscated** - Variable names mangled (a, n, t, e, etc.)
- ✅ **No Comments** - All comments removed
- ✅ **No Console Logs** - Debug statements stripped
- ✅ **No Debugger** - Debugger statements removed

**File Size Reduction:**
- `anti-debug.js`: 55% smaller
- `cart.js`: 34% smaller  
- `main.js`: 40% smaller
- `checkout.js`: 43% smaller

### HTML Minification
- Whitespace removed
- Comments stripped
- Attributes optimized
- ~20% size reduction

### CSS Minification
- Tailwind CSS purged and minified
- Unused styles removed
- ~90% size reduction

---

## 🚫 What Users CANNOT Do

❌ Open DevTools (F12)  
❌ Right-click / Inspect Element  
❌ View page source (Ctrl+U)  
❌ Use browser console  
❌ Step through code with debugger  
❌ Copy/paste code easily  
❌ Read variable names (all obfuscated)  
❌ See console.log outputs  
❌ Save page with Ctrl+S  

---

## ⚠️ Limitations & Bypass Methods

**Important:** No client-side protection is 100% secure. Determined users can:

1. **Disable JavaScript** - All protections are JS-based
2. **Use proxy tools** - Intercept/modify requests (Burp Suite, Fiddler)
3. **Browser extensions** - Some tools can bypass protections
4. **Download HTML** - Can use curl/wget to get raw source
5. **Network tab** - Can still see API calls in Network tab before detection
6. **Mobile debugging** - Remote debugging tools
7. **VM/Sandbox** - Run in controlled environment

**Best Use Cases:**
- Deter casual users from copying code
- Prevent quick inspection of business logic
- Make reverse engineering time-consuming
- Protect against non-technical users

**NOT effective against:**
- Professional reverse engineers
- Automated scraping tools
- Server-side vulnerabilities

---

## 📦 Production Build

### Automatic (GitHub Actions)
Every push to `main` automatically:
1. ✅ Minifies CSS with Tailwind
2. ✅ Builds Jekyll with HTML compression
3. ✅ Obfuscates all JavaScript files
4. ✅ Deploys to GitHub Pages

### Manual Build
```bash
./build-production.sh
```

Or step-by-step:
```bash
export JEKYLL_ENV=production
npm run build:css
bundle exec jekyll build
npm run minify:js
```

---

## 🔧 Configuration

### Enable/Disable Protection
To disable anti-debugging, remove from `_layouts/default.html`:
```html
<script src="{{ '/assets/js/anti-debug.js' | relative_url }}"></script>
```

### Adjust Detection Sensitivity
Edit `assets/js/anti-debug.js`:
```javascript
var threshold = 160; // Increase to make detection less sensitive
```

### Change Warning Message
Edit `assets/js/anti-debug.js`:
```javascript
document.body.innerHTML = '<div>Your custom message</div>';
```

### Disable Specific Features
Comment out sections in `anti-debug.js`:
- Disable right-click protection: Remove `contextmenu` listener
- Disable keyboard shortcuts: Remove `keydown` listener
- Disable DevTools detection: Remove `setInterval` loop
- Disable debugger trap: Remove debugger injection

---

## 🎯 Best Practices

### For Maximum Protection:
1. ✅ Keep anti-debug.js minified and obfuscated
2. ✅ Never commit unminified production files
3. ✅ Use HTTPS (already done via GitHub Pages)
4. ✅ Implement server-side validation (for forms/API)
5. ✅ Don't store sensitive data in localStorage
6. ✅ Use environment variables for secrets (never in JS)

### For Development:
- Work on `localhost` without anti-debug
- Anti-debug only loads in production (`JEKYLL_ENV=production`)
- Test in production before deployment

---

## 📊 Security Checklist

- [x] JavaScript minified and obfuscated
- [x] HTML compressed
- [x] CSS minified
- [x] Right-click disabled
- [x] DevTools detection enabled
- [x] Console disabled
- [x] Debugger traps active
- [x] Keyboard shortcuts blocked
- [x] Text selection prevented
- [x] Automatic deployment with protection
- [ ] Server-side API validation (if applicable)
- [ ] Rate limiting (if applicable)
- [ ] CAPTCHA for forms (optional)

---

## 🚀 Deployment Status

Check deployment: https://github.com/milosljubenovic/ekoza.shop/actions

Live site: https://milosljubenovic.github.io/ekoza.shop/

---

## 📝 Notes

- Protection only works when JavaScript is enabled
- Adds ~2KB to page load (minified anti-debug.js)
- May interfere with legitimate browser extensions
- Some users may see warning if they have window managers that resize windows
- Mobile browsers less affected (no DevTools detection)
- Consider adding "Report a problem" link if legitimate users are blocked

---

## 🆘 Troubleshooting

**Issue:** Legitimate users seeing "Developer tools" warning  
**Solution:** Adjust `threshold` variable to be less sensitive (increase from 160 to 200+)

**Issue:** Protection not working on deployed site  
**Solution:** Ensure `JEKYLL_ENV=production` is set in GitHub Actions (already configured)

**Issue:** Site not loading at all  
**Solution:** Check browser console (if you can) for JavaScript errors. Disable anti-debug temporarily.

**Issue:** Right-click disabled for form inputs  
**Solution:** Add exceptions in anti-debug.js for specific elements:
```javascript
if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
```
