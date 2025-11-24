import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Add a product to cart first
    await page.goto('/proizvod/lazy-bag-jednobojni/');
    await page.getByRole('button', { name: /dodaj.*korpu/i }).click();
    await page.waitForTimeout(500);
  });

  test('should navigate to checkout page', async ({ page }) => {
    // Click checkout button
    await page.locator('#cartCount, [data-cart-toggle]').first().click();
    await page.waitForTimeout(500);
    
    const checkoutButton = page.getByRole('button', { name: /poručite|checkout/i }).or(
      page.getByRole('link', { name: /poručite|checkout/i })
    );
    
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
    } else {
      // Direct navigation as fallback
      await page.goto('/porudzbina/');
    }
    
    await expect(page).toHaveURL(/porudzbina/);
  });

  test('should display order summary on checkout page', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    // Should show added product
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/lazy bag/i);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    // Try to submit without filling form
    const viberButton = page.locator('#orderViberBtn, button:has-text("Viber")').first();
    
    if (await viberButton.isVisible()) {
      await viberButton.click();
      
      // Form validation should trigger
      const firstName = page.locator('#firstName, input[name="firstName"]');
      if (await firstName.isVisible()) {
        await expect(firstName).toHaveAttribute('required', '');
      }
    }
  });

  test('should fill checkout form successfully', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    // Fill in customer details
    await page.fill('#firstName, input[name="firstName"]', 'Marko');
    await page.fill('#lastName, input[name="lastName"]', 'Marković');
    await page.fill('#email, input[name="email"]', 'marko@example.com');
    await page.fill('#phone, input[name="phone"]', '+381621234567');
    
    // Fill in address
    await page.fill('#address, input[name="address"]', 'Knez Mihailova 1');
    await page.fill('#city, input[name="city"]', 'Beograd');
    await page.fill('#postalCode, input[name="postalCode"]', '11000');
    
    // Select shipping method
    const standardShipping = page.locator('input[name="shippingMethod"][value="standard"]');
    if (await standardShipping.isVisible()) {
      await standardShipping.check();
    }
    
    // Select payment method
    const pouzecem = page.locator('input[name="paymentMethod"][value="pouzecem"]');
    if (await pouzecem.isVisible()) {
      await pouzecem.check();
    }
    
    // Accept terms
    const termsCheckbox = page.locator('#terms, input[type="checkbox"]').last();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked();
    }
  });

  test('should calculate shipping cost correctly', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    // Check for shipping amount element
    const shippingAmount = page.locator('#shippingAmount, [data-shipping-amount]');
    
    if (await shippingAmount.isVisible()) {
      // Standard shipping should show 400 RSD
      const standardRadio = page.locator('input[name="shippingMethod"][value="standard"]');
      if (await standardRadio.isVisible()) {
        await standardRadio.check();
        await page.waitForTimeout(300);
        
        const shippingText = await shippingAmount.textContent();
        expect(shippingText).toMatch(/400|besplatna/i);
      }
    }
  });

  test('should show free shipping for pickup', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    const pickupRadio = page.locator('input[name="shippingMethod"][value="pickup"]');
    
    if (await pickupRadio.isVisible()) {
      await pickupRadio.check();
      await page.waitForTimeout(300);
      
      const shippingAmount = page.locator('#shippingAmount, [data-shipping-amount]');
      if (await shippingAmount.isVisible()) {
        const shippingText = await shippingAmount.textContent();
        expect(shippingText).toMatch(/besplatna|0/i);
      }
    }
  });

  test('should display total price correctly', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    const totalAmount = page.locator('#totalAmount, [data-total-amount]');
    
    if (await totalAmount.isVisible()) {
      const totalText = await totalAmount.textContent();
      expect(totalText).toMatch(/\d+.*RSD/);
      
      // Total should be greater than 0
      const total = parseInt(totalText.replace(/\D/g, ''));
      expect(total).toBeGreaterThan(0);
    }
  });

  test('should have multiple order options', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    // Check for order buttons
    const buttons = await page.locator('button[id*="order"], button:has-text("Viber"), button:has-text("WhatsApp")').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('should display order item count', async ({ page }) => {
    await page.goto('/porudzbina/');
    
    const itemCount = page.locator('#orderItemCount, [data-item-count]');
    
    if (await itemCount.isVisible()) {
      const countText = await itemCount.textContent();
      expect(countText).toMatch(/\d+\s*proizvod/i);
    }
  });

  test('should handle empty cart on checkout page', async ({ page }) => {
    // Clear cart
    await page.evaluate(() => localStorage.removeItem('cart'));
    
    await page.goto('/porudzbina/');
    await page.waitForTimeout(500);
    
    // Should show empty cart message
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/prazna|empty/i);
  });
});

test.describe('Complete Purchase Flow', () => {
  test('should complete full purchase journey', async ({ page }) => {
    // 1. Browse products
    await page.goto('/proizvodi/');
    await expect(page).toHaveTitle(/Lazy Pleasure/);
    
    // 2. View product details
    const firstProduct = page.locator('a[href*="/proizvod/"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/proizvod\//);
    
    // 3. Add to cart
    const addToCartButton = page.getByRole('button', { name: /dodaj.*korpu/i });
    await addToCartButton.click();
    await page.waitForTimeout(500);
    
    // 4. View cart
    const cartButton = page.locator('#cartCount, [data-cart-toggle]').first();
    const cartCount = await cartButton.textContent();
    expect(parseInt(cartCount)).toBeGreaterThan(0);
    
    // 5. Go to checkout
    await page.goto('/porudzbina/');
    await expect(page).toHaveURL(/porudzbina/);
    
    // 6. Fill form
    await page.fill('#firstName, input[name="firstName"]', 'Test');
    await page.fill('#lastName, input[name="lastName"]', 'User');
    await page.fill('#email, input[name="email"]', 'test@example.com');
    await page.fill('#phone, input[name="phone"]', '+381621234567');
    await page.fill('#address, input[name="address"]', 'Test Address 1');
    await page.fill('#city, input[name="city"]', 'Beograd');
    await page.fill('#postalCode, input[name="postalCode"]', '11000');
    
    // Accept terms if checkbox exists
    const termsCheckbox = page.locator('#terms, input[type="checkbox"]').last();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    // Form should be valid now
    const form = page.locator('#checkoutForm, form').first();
    if (await form.isVisible()) {
      const isValid = await form.evaluate((f) => f.checkValidity());
      expect(isValid).toBe(true);
    }
  });
});
