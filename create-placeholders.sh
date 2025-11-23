#!/bin/bash

# Script to create placeholder images for the Lazy Pleasure store
# This creates simple SVG placeholders for product images

mkdir -p assets/images/products
mkdir -p assets/images/categories

# Function to create SVG placeholder
create_placeholder() {
    local filename=$1
    local text=$2
    local color=${3:-"#c026d3"}
    
    cat > "$filename" << EOF
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="$color"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">
    $text
  </text>
</svg>
EOF
}

echo "Creating product placeholder images..."

# Product images
create_placeholder "assets/images/products/torba-lav-1.jpg" "Torba Lav 1" "#c026d3"
create_placeholder "assets/images/products/torba-lav-2.jpg" "Torba Lav 2" "#a21caf"
create_placeholder "assets/images/products/torba-lav-3.jpg" "Torba Lav 3" "#86198f"

create_placeholder "assets/images/products/ranac-1.jpg" "Gradski Ranac 1" "#0891b2"
create_placeholder "assets/images/products/ranac-2.jpg" "Gradski Ranac 2" "#0e7490"

create_placeholder "assets/images/products/novcanik-1.jpg" "Novčanik Premium" "#ea580c"

create_placeholder "assets/images/products/poslovni-ranac-1.jpg" "Poslovni Ranac 1" "#4338ca"
create_placeholder "assets/images/products/poslovni-ranac-2.jpg" "Poslovni Ranac 2" "#3730a3"

create_placeholder "assets/images/products/sport-1.jpg" "Sportska Torba" "#dc2626"

create_placeholder "assets/images/products/crossbody-1.jpg" "Crossbody 1" "#db2777"
create_placeholder "assets/images/products/crossbody-2.jpg" "Crossbody 2" "#be185d"

create_placeholder "assets/images/products/muski-novcanik-1.jpg" "Muški Novčanik" "#78350f"

create_placeholder "assets/images/products/mini-ruksak-1.jpg" "Mini Ruksak 1" "#f472b6"
create_placeholder "assets/images/products/mini-ruksak-2.jpg" "Mini Ruksak 2" "#ec4899"

create_placeholder "assets/images/products/putna-1.jpg" "Putna Torba" "#1e40af"

create_placeholder "assets/images/products/torbica-tel-1.jpg" "Torbica za Telefon" "#7c3aed"

# Category images
create_placeholder "assets/images/categories/torbe.jpg" "Torbe" "#c026d3"
create_placeholder "assets/images/categories/ranci.jpg" "Ranci" "#0891b2"
create_placeholder "assets/images/categories/novcanici.jpg" "Novčanici" "#ea580c"
create_placeholder "assets/images/categories/sport.jpg" "Sport" "#dc2626"
create_placeholder "assets/images/categories/putne.jpg" "Putne" "#1e40af"
create_placeholder "assets/images/categories/dodaci.jpg" "Dodaci" "#7c3aed"

echo "✅ Placeholder images created successfully!"
echo "📝 Note: Replace these SVG files with real product images for production."
