import { test, expect } from '@playwright/test';

// Validates the checkout-form HTML5 rules added in ekoza.shop#14:
//   - email requires a TLD (rejects "test@example")
//   - phone matches \+381\d{7,10}
//   - postalCode is exactly 5 digits
//   - firstName / lastName / address / city have minlength rules
//
// Each test:
//   1. Seeds the cart directly via localStorage (faster than clicking the
//      gallery flow every time -- that's covered by vez-flow.spec.js).
//   2. Intercepts the orders Cloudflare Worker so we never create a real
//      order during CI.
//   3. Fills the form, attempts submit, asserts whether the API was hit.
//
// "Blocked" tests confirm the API was NOT called (HTML5 form validation
// fired). The single "passes" test confirms the API WOULD have been called
// when every field is valid -- the route handler stubs a success response
// so no order lands in R2.

const SITE = 'https://ekoza.shop';
const ORDERS_API = '**/ekozashop-orders.7kqq5yynhz.workers.dev/**';

const SEED_CART = [{
  name: 'Lazy Bag - Jednobojni',
  price: 3900,
  image: 'https://ekoza.shop/assets/images/products/lazy-bag-jednobojni/lazy-bag-jednobojni.png',
  url: '/proizvod/lazy-bag-jednobojni/',
  quantity: 1,
  color: 'Crna',
  size: '210/90CM',
  embroidery: 'Flowers',
  embroideryImage: '/assets/images/embroidery/other/flowers.png',
  customName: null,
  font: null,
  id: 999999,
}];

const VALID = {
  firstName: 'Marko',
  lastName: 'Marković',
  email: 'marko@example.com',
  phone: '+381622220894',
  address: 'Knez Mihailova 12',
  city: 'Beograd',
  postalCode: '11000',
};

async function seedCartAndOpenCheckout(page) {
  // Land on the homepage first so we have a same-origin context to set
  // localStorage, then navigate to checkout.
  await page.goto(`${SITE}/`);
  await page.evaluate(([cart]) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [SEED_CART]);
  await page.goto(`${SITE}/porudzbina/`);
  await page.waitForLoadState('networkidle');
}

async function fillForm(page, overrides = {}) {
  const fields = { ...VALID, ...overrides };
  // Phone has an input handler that normalizes 0XXXXXXXXX -> +381XXXXXXXXX.
  // We pass the already-normalized form to keep tests deterministic.
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    await page.fill(`#${name}`, '');
    if (value !== '') await page.fill(`#${name}`, value);
  }
  await page.check('#terms');
}

async function trySubmitWithIntercept(page) {
  // Count only POST requests -- the browser also fires an OPTIONS preflight
  // for the cross-origin POST, but the preflight by itself doesn't mean the
  // order was submitted. Counting POSTs gives us a clean "would the order
  // have actually been sent?" signal.
  let postHits = 0;
  await page.route(ORDERS_API, async (route) => {
    if (route.request().method() === 'POST') postHits += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': 'https://ekoza.shop' },
      body: JSON.stringify({ success: true, orderId: 'TEST-INTERCEPTED', message: 'ok' }),
    });
  });
  await page.locator('#submitOrderBtn').click();
  // Give browser time to either dispatch the fetch or block via reportValidity.
  await page.waitForTimeout(1500);
  return postHits;
}

test.describe('checkout HTML5 validation', () => {
  test.beforeEach(async ({ page }) => {
    await seedCartAndOpenCheckout(page);
  });

  test('blocks submit with invalid email (no TLD)', async ({ page }) => {
    await fillForm(page, { email: 'test@example' });
    const hits = await trySubmitWithIntercept(page);
    expect(hits).toBe(0);
    await expect(page.locator('#email')).not.toHaveJSProperty('validity.valid', true);
  });

  test('blocks submit with empty required field', async ({ page }) => {
    await fillForm(page, { firstName: '' });
    const hits = await trySubmitWithIntercept(page);
    expect(hits).toBe(0);
    await expect(page.locator('#firstName')).toHaveJSProperty('validity.valueMissing', true);
  });

  test('blocks submit with too-short firstName', async ({ page }) => {
    await fillForm(page, { firstName: 'M' });
    const hits = await trySubmitWithIntercept(page);
    expect(hits).toBe(0);
    await expect(page.locator('#firstName')).toHaveJSProperty('validity.tooShort', true);
  });

  test('blocks submit with non-Serbian phone shape', async ({ page }) => {
    await fillForm(page, { phone: '12345' });
    const hits = await trySubmitWithIntercept(page);
    expect(hits).toBe(0);
    await expect(page.locator('#phone')).toHaveJSProperty('validity.patternMismatch', true);
  });

  test('blocks submit with non-numeric postal code', async ({ page }) => {
    await fillForm(page, { postalCode: 'abcde' });
    const hits = await trySubmitWithIntercept(page);
    expect(hits).toBe(0);
    await expect(page.locator('#postalCode')).toHaveJSProperty('validity.patternMismatch', true);
  });

  test('blocks submit with 4-digit postal code', async ({ page }) => {
    await fillForm(page, { postalCode: '1100' });
    const hits = await trySubmitWithIntercept(page);
    expect(hits).toBe(0);
    await expect(page.locator('#postalCode')).toHaveJSProperty('validity.patternMismatch', true);
  });

  test('allows submit when every field is valid (API would have been called)', async ({ page }) => {
    await fillForm(page); // all valid defaults
    const hits = await trySubmitWithIntercept(page);
    expect(hits).toBe(1);
    // Sanity: every field reports valid.
    for (const id of ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode']) {
      await expect(page.locator(`#${id}`)).toHaveJSProperty('validity.valid', true);
    }
  });
});
