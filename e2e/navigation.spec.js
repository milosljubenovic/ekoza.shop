import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Lazy Pleasure/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('link', { name: /proizvodi/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /kontakt/i })).toBeVisible();
  });

  test('should have working cart button', async ({ page }) => {
    await page.goto('/');
    
    const cartButton = page.locator('#cartCount').or(page.getByRole('button', { name: /korpa/i }));
    await expect(cartButton).toBeVisible();
  });
});

test.describe('Products Page', () => {
  test('should display product categories', async ({ page }) => {
    await page.goto('/proizvodi/');
    
    await expect(page.getByText(/lazy bag/i).first()).toBeVisible();
  });

  test('should show product cards with images', async ({ page }) => {
    await page.goto('/proizvodi/');
    
    const productCards = page.locator('article, .product-card').first();
    await expect(productCards).toBeVisible();
    
    const productImage = page.locator('img').first();
    await expect(productImage).toBeVisible();
  });

  test('should navigate to product details', async ({ page }) => {
    await page.goto('/proizvodi/');
    
    // Click first product link
    const firstProductLink = page.locator('a[href*="/proizvod/"]').first();
    await firstProductLink.click();
    
    // Should be on product detail page
    await expect(page).toHaveURL(/\/proizvod\//);
  });
});

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a specific product (adjust URL as needed)
    await page.goto('/proizvod/lazy-bag-jednobojni/');
  });

  test('should display product details', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('img').first()).toBeVisible();
    
    // Should show price
    const priceText = await page.textContent('body');
    expect(priceText).toMatch(/\d+.*RSD/i);
  });

  test('should have add to cart button', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: /dodaj.*korpu/i });
    await expect(addToCartButton).toBeVisible();
  });

  test('should allow quantity selection', async ({ page }) => {
    const quantityInput = page.locator('#quantity, input[type="number"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('3');
      await expect(quantityInput).toHaveValue('3');
    }
  });
});
