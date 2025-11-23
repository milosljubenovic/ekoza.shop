#!/bin/bash

# Script to check which product images are missing
# Run this after adding real images to identify what's still needed

echo "======================================"
echo "Product Image Checker"
echo "======================================"
echo ""

IMAGES_DIR="assets/images/products"
MISSING_COUNT=0
FOUND_COUNT=0

# List of all required images based on current product data
REQUIRED_IMAGES=(
  "lazy-foteljica-crna.jpg"
  "lazy-foteljica-siva.jpg"
  "lazy-foteljica-braon.jpg"
  "lazy-lopta-fudbal-crno-bela.jpg"
  "lazy-lopta-fudbal-plavo-bela.jpg"
  "lazy-tabure-crna.jpg"
  "lazy-tabure-crvena.jpg"
  "lazy-tabure-plava.jpg"
  "lazy-tabure-zelena.jpg"
  "granule-bela.jpg"
  "lazy-jednobojni-crna.jpg"
  "lazy-jednobojni-siva.jpg"
  "lazy-jednobojni-plava.jpg"
  "lazy-jednobojni-bordo.jpg"
  "lazy-visebojni-duga.jpg"
  "lazy-visebojni-geometrijski.jpg"
  "lazy-visebojni-tropski.jpg"
  "lazy-teddy-bela.jpg"
  "lazy-teddy-bez.jpg"
  "lazy-teddy-siva.jpg"
  "lazy-foteljica-premium-crna.jpg"
  "lazy-foteljica-premium-siva.jpg"
  "lazy-foteljica-premium-plava.jpg"
  "lazy-vibrant-crvena.jpg"
  "lazy-vibrant-zelena.jpg"
  "lazy-vibrant-plava.jpg"
  "lazy-vibrant-zuta.jpg"
  "lazy-vibrant-narandzasta.jpg"
  "lazy-lopta-kosarka.jpg"
)

echo "Checking product images..."
echo ""

for img in "${REQUIRED_IMAGES[@]}"; do
  if [ -f "$IMAGES_DIR/$img" ]; then
    echo "✓ $img"
    ((FOUND_COUNT++))
  else
    echo "✗ $img [MISSING]"
    ((MISSING_COUNT++))
  fi
done

echo ""
echo "======================================"
echo "Summary:"
echo "  Found: $FOUND_COUNT images"
echo "  Missing: $MISSING_COUNT images"
echo "======================================"
echo ""

if [ $MISSING_COUNT -eq 0 ]; then
  echo "✓ All product images are present!"
else
  echo "⚠ Upload the missing images to: $IMAGES_DIR/"
  echo ""
  echo "Image requirements:"
  echo "  - Format: JPG, PNG, or WebP"
  echo "  - Min size: 800x800px"
  echo "  - Recommended: 1200x1200px"
  echo "  - Max file size: 500KB"
fi

echo ""

# Check category images
echo "======================================"
echo "Checking category images..."
echo ""

CATEGORY_IMAGES=(
  "lazy-foteljica.jpg"
  "lazy-lopta.jpg"
  "lazy-tabure.jpg"
  "dopune-granule.jpg"
  "lazy-bag-jednobojni.jpg"
  "lazy-bag-visebojni.jpg"
  "lazy-teddy.jpg"
)

CAT_MISSING=0
CAT_FOUND=0
CATEGORIES_DIR="assets/images/categories"

for img in "${CATEGORY_IMAGES[@]}"; do
  if [ -f "$CATEGORIES_DIR/$img" ]; then
    echo "✓ $img"
    ((CAT_FOUND++))
  else
    echo "✗ $img [MISSING]"
    ((CAT_MISSING++))
  fi
done

echo ""
echo "Category images: $CAT_FOUND found, $CAT_MISSING missing"
echo "======================================"
