# Image Guidelines

## Product Images

All product images should be placed in the `products/` directory.

### Required Images

#### Lazy Foteljica Standard
- `lazy-foteljica-crna.jpg` - Black color variant
- `lazy-foteljica-siva.jpg` - Gray color variant
- `lazy-foteljica-braon.jpg` - Brown color variant

#### Lazy Lopta Fudbal
- `lazy-lopta-fudbal-crno-bela.jpg` - Classic black-white variant
- `lazy-lopta-fudbal-plavo-bela.jpg` - Blue-white variant

#### Lazy Tabure Okrugli
- `lazy-tabure-crna.jpg` - Black color
- `lazy-tabure-crvena.jpg` - Red color
- `lazy-tabure-plava.jpg` - Blue color
- `lazy-tabure-zelena.jpg` - Green color

#### Granule Premium
- `granule-bela.jpg` - White granules

#### Lazy Bag Jednobojni - Crni
- `lazy-jednobojni-crna.jpg` - Black
- `lazy-jednobojni-siva.jpg` - Gray
- `lazy-jednobojni-plava.jpg` - Dark blue
- `lazy-jednobojni-bordo.jpg` - Burgundy

#### Lazy Bag Višebojni - Duga
- `lazy-visebojni-duga.jpg` - Rainbow pattern
- `lazy-visebojni-geometrijski.jpg` - Geometric pattern
- `lazy-visebojni-tropski.jpg` - Tropical pattern

#### Lazy Teddy - Beli
- `lazy-teddy-bela.jpg` - White teddy
- `lazy-teddy-bez.jpg` - Beige teddy
- `lazy-teddy-siva.jpg` - Gray teddy

#### Lazy Foteljica Premium
- `lazy-foteljica-premium-crna.jpg` - Black premium
- `lazy-foteljica-premium-siva.jpg` - Dark gray premium
- `lazy-foteljica-premium-plava.jpg` - Dark blue premium

#### Lazy Bag Jednobojni - Vibrantne boje
- `lazy-vibrant-crvena.jpg` - Red
- `lazy-vibrant-zelena.jpg` - Green
- `lazy-vibrant-plava.jpg` - Blue
- `lazy-vibrant-zuta.jpg` - Yellow
- `lazy-vibrant-narandzasta.jpg` - Orange

#### Lazy Lopta Košarka
- `lazy-lopta-kosarka.jpg` - Orange basketball

### Image Specifications

- **Format**: JPG (preferred), PNG, or WebP
- **Dimensions**: Minimum 800x800px, recommended 1200x1200px
- **Aspect Ratio**: 1:1 (square) preferred, or 4:3
- **File Size**: Under 500KB per image (optimize before upload)
- **Background**: White or transparent background preferred
- **Quality**: High quality, well-lit product photos

### Category Images

Category images should be placed in the `categories/` directory:
- `lazy-foteljica.jpg`
- `lazy-lopta.jpg`
- `lazy-tabure.jpg`
- `dopune-granule.jpg`
- `lazy-bag-jednobojni.jpg`
- `lazy-bag-visebojni.jpg`
- `lazy-teddy.jpg`

**Category Image Specs**: 600x400px minimum, landscape orientation

## Naming Convention

- Use lowercase letters
- Use hyphens (-) instead of spaces or underscores
- Use descriptive names that match the color/variant
- Serbian characters should be transliterated (š→s, ž→z, č→c, ć→c, đ→dj)

## Upload Instructions

1. Optimize images before upload (use tools like TinyPNG, ImageOptim)
2. Ensure proper naming matches the paths in the data files
3. Maintain consistent quality across all product variants
4. Test images on the site after upload

## Fallback Behavior

If a specific color variant image is missing, the system will automatically fall back to the product's default image (first image in the images array). However, it's recommended to have all color-specific images for the best user experience.
