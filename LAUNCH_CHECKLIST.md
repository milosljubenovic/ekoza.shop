# Pre-Launch Checklist

## ✅ Content & Data

### Product Data
- [ ] All products have accurate information
- [ ] Prices are correct (base_price + modifiers)
- [ ] Product descriptions are complete and error-free
- [ ] All categories are assigned correctly
- [ ] Stock status (in_stock) is accurate
- [ ] Featured products are selected

### Images
- [ ] Run `./check-images.sh` to verify all images
- [ ] All product color variants have images (29 total)
- [ ] All category images uploaded (7 total)
- [ ] Images are optimized (under 500KB each)
- [ ] Images are high quality and properly lit
- [ ] Test image fallback behavior

### Copy & Content
- [ ] Homepage hero text updated
- [ ] About/footer information updated
- [ ] Contact information correct
- [ ] Delivery information page (`dostava.html`)
- [ ] Payment methods page (`nacin-placanja.html`)
- [ ] Privacy policy (`politika-privatnosti.html`)
- [ ] Terms of service (`uslovi-koriscenja.html`)

## 🔧 Configuration

### Site Settings (`_config.yml`)
- [ ] Site title and description
- [ ] Contact information (phone, email)
- [ ] Social media links
- [ ] Company address
- [ ] SEO metadata

### Contact Integration
- [ ] WhatsApp number updated in `assets/js/cart.js`
- [ ] WhatsApp number updated in `kontakt.html`
- [ ] WhatsApp number updated in `_includes/footer.html`
- [ ] Contact form tested
- [ ] Cart to WhatsApp flow tested

## 🎨 Design & UX

### Visual Design
- [ ] Logo uploaded and configured
- [ ] Favicon created and added
- [ ] Color scheme finalized
- [ ] Typography consistent
- [ ] Light/dark mode tested
- [ ] Animations working smoothly

### Responsive Design
- [ ] Test on mobile (320px - 480px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Test on large screens (1920px+)
- [ ] Navigation works on all devices
- [ ] Cart modal works on mobile

## 🧪 Testing

### Functionality
- [ ] Product search works correctly
- [ ] Category filtering works
- [ ] Color selection changes images
- [ ] Size selection updates price
- [ ] Price calculation accurate
- [ ] Add to cart works
- [ ] Cart persists in localStorage
- [ ] Cart item count updates
- [ ] Remove from cart works
- [ ] WhatsApp order generation correct

### Page Testing
- [ ] Homepage loads correctly
- [ ] All product pages load
- [ ] All category pages load
- [ ] Contact page works
- [ ] Delivery page accessible
- [ ] Payment page accessible
- [ ] Privacy policy accessible
- [ ] Terms of service accessible

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome)

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] No broken links (404s)

## 🚀 SEO & Analytics

### SEO Basics
- [ ] Page titles optimized
- [ ] Meta descriptions added
- [ ] Alt text for all images
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Structured data for products

### Analytics
- [ ] Google Analytics installed (optional)
- [ ] Facebook Pixel installed (optional)
- [ ] Event tracking configured (optional)

## 🔒 Security & Compliance

### Legal & Compliance
- [ ] Privacy policy complete
- [ ] Terms of service complete
- [ ] Cookie consent (if needed)
- [ ] GDPR compliance (if applicable)
- [ ] Company registration info in footer

### Security
- [ ] HTTPS enabled (when deployed)
- [ ] No sensitive data exposed
- [ ] No API keys in frontend code

## 📱 Social Media

- [ ] Facebook page linked
- [ ] Instagram profile linked
- [ ] WhatsApp Business set up
- [ ] Social media icons work
- [ ] Share functionality tested (if applicable)

## 🌐 Deployment

### Pre-Deploy
- [ ] Run production build: `JEKYLL_ENV=production bundle exec jekyll build`
- [ ] Test production build locally
- [ ] Verify all paths work in production
- [ ] Check for hardcoded localhost URLs

### Hosting Setup
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] CDN configured (if using)
- [ ] DNS records set up
- [ ] Email forwarding configured

### Post-Deploy
- [ ] Test site on live URL
- [ ] Test WhatsApp integration from live site
- [ ] Verify all images load
- [ ] Check mobile experience
- [ ] Submit sitemap to Google Search Console

## 📊 Marketing

- [ ] Social media announcement posts ready
- [ ] Initial product photos for social media
- [ ] Launch promotion/discount ready (if applicable)
- [ ] Email list set up (if applicable)

## 📞 Customer Support

- [ ] WhatsApp Business hours set
- [ ] Auto-reply messages configured
- [ ] Quick replies prepared
- [ ] Product FAQs ready
- [ ] Return/refund policy clear

## 🎯 Post-Launch

### Week 1
- [ ] Monitor WhatsApp messages daily
- [ ] Track which products get most views
- [ ] Check for any bugs/issues
- [ ] Gather initial customer feedback

### Ongoing
- [ ] Regular product image updates
- [ ] Update prices as needed
- [ ] Add new products
- [ ] Monitor site performance
- [ ] Regular backups

---

## 🚀 Quick Launch Commands

```bash
# Final checks
./check-images.sh

# Production build
JEKYLL_ENV=production bundle exec jekyll build
npm run build

# Deploy (depends on your hosting)
# Example: rsync, git push, FTP, etc.
```

---

**Ready to Launch?** Go through this checklist item by item. When everything is checked, you're ready to go live! 🎉
