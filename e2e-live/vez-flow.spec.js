import { test, expect } from '@playwright/test';

const SITE = 'https://ekoza.shop';
const SCREEN_DIR = './e2e-live/screens';

test('vez flow renders separate lines in cart and checkout', async ({ page }) => {
  // 1. Open the product page that supports embroidery + has stock.
  await page.goto(`${SITE}/proizvod/lazy-bag-jednobojni/`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SCREEN_DIR}/01-product-page.png`, fullPage: true });

  // 2. Pick a color and size (whatever's first). Use radio inputs the
  //    product template ships -- `.color-radio` / `.size-radio`.
  const firstColor = page.locator('input.color-radio').first();
  await firstColor.check();
  const firstSize = page.locator('input.size-radio').first();
  await firstSize.check();
  const colorValue = await firstColor.getAttribute('value');
  const sizeValue = await firstSize.getAttribute('value');
  console.log('Picked color:', colorValue, '| size:', sizeValue);

  // 3. Check "Dodaj vez".
  await page.locator('#embroideryCheckbox').check();
  await page.screenshot({ path: `${SCREEN_DIR}/02-vez-checked.png`, fullPage: true });

  // 4. Open the embroidery gallery and pick the Flowers design.
  await page.getByRole('button', { name: /izaberi dizajn/i }).click();
  await page.waitForSelector('#embroideryGalleryModal:not(.hidden)', { timeout: 5000 });
  // The only embroidery image actually deployed is /assets/images/embroidery/other/flowers.png.
  // Filter to its category if possible to make the click reliable.
  const flowersTile = page.locator('.embroidery-design-item').filter({ hasText: /flowers/i }).first();
  await flowersTile.click();
  await page.screenshot({ path: `${SCREEN_DIR}/03-vez-picked.png`, fullPage: true });

  // 5. Add to cart.
  await page.getByRole('button', { name: /dodaj u korpu/i }).first().click();

  // 6. Open the cart and confirm structured lines.
  await page.locator('button[onclick="toggleCart()"]').first().click();
  await page.waitForSelector('#cartItems', { timeout: 5000 });
  await page.waitForTimeout(500); // let the toggle animation settle
  await page.screenshot({ path: `${SCREEN_DIR}/04-cart-open.png`, fullPage: true });

  const cartHtml = await page.locator('#cartItems').innerHTML();
  console.log('--- cartItems HTML excerpt ---');
  console.log(cartHtml.slice(0, 1500));

  // Critical assertions: the cart shows the structured Boja/Veličina/Vez
  // lines as separate <p> rows, and the product title is CLEAN (does NOT
  // contain the bracketed [Vez: ...] from the old folded format).
  await expect(page.locator('#cartItems')).toContainText(/Boja:/i);
  await expect(page.locator('#cartItems')).toContainText(/Veličina:/i);
  await expect(page.locator('#cartItems')).toContainText(/Vez:/i);
  await expect(page.locator('#cartItems h3, #cartItems a').first()).not.toContainText('[Vez:');

  // 7. Navigate to checkout.
  await page.locator('a[href*="/porudzbina"], button[onclick*="checkout"]').first().click();
  await page.waitForURL(/porudzbina/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SCREEN_DIR}/05-checkout-summary.png`, fullPage: true });

  const summaryHtml = await page.locator('#orderSummaryItems').innerHTML();
  console.log('--- orderSummaryItems HTML excerpt ---');
  console.log(summaryHtml.slice(0, 1500));

  await expect(page.locator('#orderSummaryItems')).toContainText(/Boja:/i);
  await expect(page.locator('#orderSummaryItems')).toContainText(/Veličina:/i);
  await expect(page.locator('#orderSummaryItems')).toContainText(/Vez:/i);

  // Snapshot the localStorage cart so we can confirm embroideryImage made it through.
  const cartLS = await page.evaluate(() => localStorage.getItem('cart'));
  console.log('--- localStorage cart ---');
  console.log(cartLS);

  // STOP HERE -- do NOT submit; we don't want to create real orders.
});
