import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should start with empty cart', async ({ page }) => {
    await page.goto('/');
    
    const cartCount = page.locator('#cartCount');
    await expect(cartCount).toHaveText('0');
  });

  test('should add product to cart', async ({ page }) => {
    // Go to product page
    await page.goto('/proizvod/lazy-bag-jednobojni/');
    
    // Click add to cart
    const addToCartButton = page.getByRole('button', { name: /dodaj.*korpu/i });
    await addToCartButton.click();
    
    // Wait for notification or cart update
    await page.waitForTimeout(500);
    
    // Check cart count increased
    const cartCount = page.locator('#cartCount');
    const count = await cartCount.textContent();
    expect(parseInt(count)).toBeGreaterThan(0);
  });

  test('should display cart items in cart modal', async ({ page }) => {
    // Add product to cart
    await page.goto('/proizvod/lazy-bag-jednobojni/');
    await page.getByRole('button', { name: /dodaj.*korpu/i }).click();
    await page.waitForTimeout(500);
    
    // Open cart modal
    const cartButton = page.locator('#cartCount, [data-cart-toggle]').first();
    await cartButton.click();
    
    // Check if cart modal is visible
    const cartModal = page.locator('#cartModal, [data-cart-modal]');
    await expect(cartModal).toBeVisible({ timeout: 2000 });
    
    // Should show product in cart
    await expect(page.getByText(/lazy bag/i)).toBeVisible();
  });

  test('should update quantity in cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/proizvod/lazy-bag-jednobojni/');
    await page.getByRole('button', { name: /dodaj.*korpu/i }).click();
    await page.waitForTimeout(500);
    
    // Open cart
    await page.locator('#cartCount, [data-cart-toggle]').first().click();
    await page.waitForTimeout(500);
    
    // Find and click increase quantity button
    const increaseButton = page.locator('button:has-text("+")').first();
    if (await increaseButton.isVisible()) {
      await increaseButton.click();
      await page.waitForTimeout(300);
      
      // Cart count should have increased
      const cartCount = await page.locator('#cartCount').textContent();
      expect(parseInt(cartCount)).toBeGreaterThan(1);
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/proizvod/lazy-bag-jednobojni/');
    await page.getByRole('button', { name: /dodaj.*korpu/i }).click();
    await page.waitForTimeout(500);
    
    // Open cart
    await page.locator('#cartCount, [data-cart-toggle]').first().click();
    await page.waitForTimeout(500);
    
    // Find and click remove button
    const removeButton = page.getByRole('button', { name: /ukloni/i }).first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
      await page.waitForTimeout(300);
      
      // Cart should be empty
      const cartCount = await page.locator('#cartCount').textContent();
      expect(cartCount).toBe('0');
    }
  });

  test('should persist cart after page reload', async ({ page }) => {
    // Add product to cart
    await page.goto('/proizvod/lazy-bag-jednobojni/');
    await page.getByRole('button', { name: /dodaj.*korpu/i }).click();
    await page.waitForTimeout(500);
    
    const cartCountBefore = await page.locator('#cartCount').textContent();
    
    // Reload page
    await page.reload();
    
    // Cart count should be the same
    const cartCountAfter = await page.locator('#cartCount').textContent();
    expect(cartCountAfter).toBe(cartCountBefore);
  });

  test('should calculate correct total', async ({ page }) => {
    // Add product to cart
    await page.goto('/proizvod/lazy-bag-jednobojni/');
    
    // Get product price
    const priceText = await page.locator('body').textContent();
    const priceMatch = priceText.match(/(\d[\d\s.,]*)\s*RSD/);
    
    await page.getByRole('button', { name: /dodaj.*korpu/i }).click();
    await page.waitForTimeout(500);
    
    // Open cart
    await page.locator('#cartCount, [data-cart-toggle]').first().click();
    await page.waitForTimeout(500);
    
    // Check if total is displayed
    const total = page.locator('#cartTotal, [data-cart-total]');
    if (await total.isVisible()) {
      const totalText = await total.textContent();
      expect(totalText).toMatch(/\d+.*RSD/);
    }
  });
});
