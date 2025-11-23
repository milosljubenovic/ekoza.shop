# Ekoza Shop - Lazy Bag E-commerce Site

Modern e-commerce website for lazy bag products built with Jekyll and Tailwind CSS.

## 🚀 Features

- **Futuristic Dark Theme** - Modern gradient design with animations
- **Dynamic Pricing** - Base price + color/size modifiers  
- **Single Color Selection** - Radio button selection with image switching
- **Color-Specific Images** - Each color variant has its own product image
- **Light/Dark Mode** - Theme toggle with localStorage persistence
- **Live Search** - Real-time product search
- **Shopping Cart** - Add to cart with quantity management
- **Checkout System** - Complete order form with Google Sheets integration
- **Order Tracking** - Track order status in real-time
- **Email Notifications** - Automatic order confirmations
- **Mobile Responsive** - Works on all devices

## 📦 Product Categories

1. **Lazy Foteljica** - Comfortable lazy chairs
2. **Lazy Lopta** - Ball-shaped lazy bags  
3. **Lazy Tabure** - Compact lazy stools
4. **Dopune za lazy bag (granule)** - Refill granules
5. **Lazy Bag Jednobojni** - Single-color lazy bags
6. **Lazy Bag Višebojni** - Multi-color lazy bags
7. **Lazy Teddy** - Soft teddy material lazy bags

## 🚀 Quick Start

### Prerequisites

- Ruby 2.7+
- Node.js 14+
- Bundler (`gem install bundler`)

### Installation

1. **Install dependencies:**
```bash
bundle install
npm install
```

2. **Start development server:**
```bash
./start.sh
```

The site will be available at `http://localhost:4000`

## 📁 Project Structure

```
ekoza.shop/
├── _config.yml           # Jekyll configuration
├── _data/                # JSON database
│   ├── products.json     # Product catalog
│   └── categories.json   # Category definitions
├── _includes/            # Reusable components
│   ├── header.html       # Navigation
│   ├── footer.html       # Footer
│   └── cart-modal.html   # Shopping cart
├── _layouts/             # Layout templates
│   ├── default.html      # Base layout
│   └── product.html      # Product page
├── assets/
│   ├── css/
│   │   ├── main.css      # Custom styles & animations
│   │   └── output.css    # Tailwind output
│   ├── js/
│   │   ├── cart.js       # Cart functionality
│   │   └── main.js       # Site functions
│   └── images/           # Product images
├── proizvod/             # Product pages
├── kategorije/           # Category pages
├── index.html            # Homepage
├── proizvodi.html        # Products listing
├── kategorije.html       # Categories listing
├── kontakt.html          # Contact page
├── porudzbina.html       # Checkout page
├── pracenje-porudzbine.html  # Order tracking
├── google-sheets-api.gs  # Google Apps Script
├── DATA_TEMPLATE.md      # Product data guide
├── GOOGLE_SHEETS_SETUP.md  # Order setup guide
└── check-images.sh       # Image checker script
```

## 🛒 Order Management System

This site includes a complete order management system using Google Sheets:

### Features:
- **Checkout Page** - Complete order form with contact & delivery info
- **Payment Methods** - Cash on delivery, bank transfer, card payment
- **Google Sheets Integration** - Orders saved automatically
- **Email Notifications** - Automatic confirmations to admin & customer
- **Order Tracking** - Real-time status updates
- **Order Status Management** - Update status in Google Sheets

### Setup:
1. Follow the complete guide in [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
2. Create a Google Sheet and deploy the Apps Script
3. Update the Web App URL in `assets/js/checkout.js`
4. Configure email addresses in the script

### Order Flow:
1. Customer adds products to cart
2. Clicks "Završi kupovinu" → redirects to `/porudzbina/`
3. Fills out contact and delivery information
4. Selects payment method
5. Submits order → saved to Google Sheets
6. Receives email confirmation with order number
7. Can track order at `/pracenje-porudzbine/`

## 📝 Adding Products

See [DATA_TEMPLATE.md](DATA_TEMPLATE.md) for complete guide.

### Quick Example:

1. Add to `_data/products.json`:
```json
{
  "id": "product-slug",
  "name": "Product Name",
  "category": "Lazy Foteljica",
  "base_price": 5000,
  "colors": [
    {
      "name": "Crna",
      "hex": "#000000",
      "price_modifier": 0,
      "image": "/assets/images/products/product-crna.jpg"
    }
  ],
  "sizes": [
    {"name": "M", "price_modifier": 0}
  ]
}
```

2. Create `proizvod/product-slug.md`

3. Upload images to `assets/images/products/`

4. Check with: `./check-images.sh`

## 🎨 Customization

- **Theme Colors**: Edit `assets/css/main.css`
- **Store Info**: Update `_config.yml` and footer
- **Google Sheets URL**: Update in `assets/js/checkout.js` and `assets/js/order-tracking.js`
- **Admin Email**: Configure in `google-sheets-api.gs`

## 🛒 Shopping Cart

Cart uses localStorage and WhatsApp integration. Update phone number in cart modal and contact page.

## 📱 Image Requirements

See [assets/images/README.md](assets/images/README.md) for complete image guidelines.

**Quick specs:**
- Format: JPG/PNG/WebP
- Size: 1200x1200px recommended
- Max file size: 500KB
- Square aspect ratio preferred

## 🔧 Development

```bash
# Watch mode (Jekyll + Tailwind)
./start.sh

# Build for production
JEKYLL_ENV=production bundle exec jekyll build
npm run build

# Check for missing images
./check-images.sh
```

## 📚 Documentation

- [DATA_TEMPLATE.md](DATA_TEMPLATE.md) - Product structure guide
- [assets/images/README.md](assets/images/README.md) - Image guidelines
- `check-images.sh` - Verify all images present

## 📄 License

© 2024 Ekoza Shop. All rights reserved.

## 📞 Contact

Update contact information in:
- `_includes/footer.html`
- `kontakt.html`
- `assets/js/cart.js` (WhatsApp number)

---

Built with ❤️ using Jekyll and Tailwind CSS
