# Product Data Template

This file explains the structure of product data in `_data/products.json`

## Product Structure

```json
{
  "id": "unique-product-slug",
  "name": "Product Display Name",
  "category": "Exact Category Name",
  "base_price": 5000,
  "price": 5000,
  "old_price": 6000,
  "description": "Short product description (1-2 sentences)",
  "images": [
    "/assets/images/products/product-default-1.jpg",
    "/assets/images/products/product-default-2.jpg"
  ],
  "colors": [
    {
      "name": "Color Name",
      "hex": "#HEX_CODE",
      "price_modifier": 0,
      "image": "/assets/images/products/product-color-variant.jpg"
    }
  ],
  "sizes": [
    {
      "name": "Size Name",
      "price_modifier": 0
    }
  ],
  "in_stock": true,
  "featured": true,
  "tags": ["tag1", "tag2", "tag3"]
}
```

## Field Descriptions

### Required Fields

- **id**: Unique slug for URL (lowercase, hyphens, no spaces)
- **name**: Display name shown to users
- **category**: Must match one of the 7 categories exactly:
  - "Lazy Foteljica"
  - "Lazy Lopta"
  - "Lazy Tabure"
  - "Dopune za lazy bag (granule)"
  - "Lazy Bag Jednobojni"
  - "Lazy Bag Višebojni"
  - "Lazy Teddy"
- **base_price**: Starting price in RSD (before color/size modifiers)
- **price**: Display price (usually same as base_price)
- **description**: Short description for product cards
- **images**: Array of at least 1 default product image
- **colors**: Array of color variants (at least 1)
- **sizes**: Array of size options (at least 1)
- **in_stock**: true/false
- **featured**: true/false (featured products appear on homepage)

### Optional Fields

- **old_price**: Original price for discount calculation
- **tags**: Array of search tags

## Color Object

Each color must have:
- **name**: Display name (e.g., "Crna", "Crvena", "Plavo-bela")
- **hex**: Hex color code for color swatch display
- **price_modifier**: Additional cost in RSD (0 for no extra cost)
- **image**: Path to color-specific product image (optional, falls back to default)

## Size Object

Each size must have:
- **name**: Display name (e.g., "M", "L", "XL", "5kg", "10kg")
- **price_modifier**: Additional cost in RSD (0 for no extra cost)

## Price Calculation

Final price = `base_price + selected_color.price_modifier + selected_size.price_modifier`

Example:
- Base price: 6500 RSD
- Braon color: +200 RSD
- XL size: +1000 RSD
- **Total**: 7700 RSD

## Product Markdown Files

Each product needs a markdown file in `proizvod/` directory:

Filename: `{product-id}.md`

```markdown
---
layout: product
title: "Product Name"
category: "Category Name"
base_price: 5000
price: 5000
old_price: 6000
description: "Product description"
images:
  - "/assets/images/products/image1.jpg"
  - "/assets/images/products/image2.jpg"
colors:
  - name: "Color 1"
    hex: "#000000"
    price_modifier: 0
    image: "/assets/images/products/product-color1.jpg"
  - name: "Color 2"
    hex: "#808080"
    price_modifier: 200
    image: "/assets/images/products/product-color2.jpg"
sizes:
  - name: "M"
    price_modifier: 0
  - name: "L"
    price_modifier: 500
  - name: "XL"
    price_modifier: 1000
in_stock: true
featured: true
---

## Detailed Product Description

Longer product description goes here with full details.

**Features:**
- Feature 1
- Feature 2
- Feature 3

**Dimensions:**
- Size M: 90x90x100cm
- Size L: 100x100x110cm
- Size XL: 110x110x120cm

**Care Instructions:**
Maintenance information here.
```

## Adding New Products

1. Add product object to `_data/products.json`
2. Create markdown file in `proizvod/{product-id}.md`
3. Upload all required images to `assets/images/products/`
4. Test the product page loads correctly
5. Verify color switching works
6. Confirm price calculations are correct

## Category Structure

Categories are defined in `_data/categories.json`:

```json
{
  "id": "category-slug",
  "name": "Display Name",
  "slug": "category-slug",
  "description": "Category description",
  "icon": "🎯",
  "image": "/assets/images/categories/category.jpg",
  "parent": null
}
```

## Notes

- All prices are in Serbian Dinars (RSD)
- Image paths must start with `/assets/images/`
- Color images are optional but recommended for better UX
- Price modifiers can be 0 if no extra charge
- Keep descriptions concise for product cards
- Use detailed descriptions in markdown files
