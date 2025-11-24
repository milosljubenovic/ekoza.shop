# Testing Documentation

## Test Suite Overview

This project includes comprehensive testing for the Lazy Pleasure e-commerce store:

- **Unit Tests** (Jest) - Test cart logic, calculations, and business rules
- **End-to-End Tests** (Playwright) - Test complete user flows across browsers

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

First, make sure your Jekyll site is built and ready:

```bash
# Build the site
npm run build

# Or run the dev server in the background
npm run dev
```

Then run the E2E tests:

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

### Run All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Unit Tests

### Cart Logic Tests (`__tests__/simple-cart.test.js`)

Tests core shopping cart functionality:

- ✅ Empty cart initialization
- ✅ Cart total calculation
- ✅ Item count calculation
- ✅ Item removal logic
- ✅ Quantity updates
- ✅ Quantity validation (minimum 1)
- ✅ Color/size variant handling
- ✅ LocalStorage persistence

### Checkout Calculation Tests

Tests order processing and pricing:

- ✅ Subtotal calculation
- ✅ Shipping cost (standard and pickup)
- ✅ Order number generation
- ✅ Email normalization
- ✅ Price formatting

## E2E Tests

### Navigation Tests (`e2e/navigation.spec.js`)

Tests basic site navigation:

- ✅ Homepage loading
- ✅ Navigation menu functionality
- ✅ Product listing page
- ✅ Product detail pages
- ✅ Product images and information display

### Cart Tests (`e2e/cart.spec.js`)

Tests shopping cart user interactions:

- ✅ Adding products to cart
- ✅ Cart modal display
- ✅ Quantity updates via UI
- ✅ Item removal from cart
- ✅ Cart persistence across page reloads
- ✅ Cart total calculation in UI

### Checkout Tests (`e2e/checkout.spec.js`)

Tests the complete checkout process:

- ✅ Checkout page navigation
- ✅ Order summary display
- ✅ Form field validation
- ✅ Shipping method selection
- ✅ Payment method selection
- ✅ Total price updates
- ✅ Complete purchase flow
- ✅ Empty cart handling

## Test Coverage

Run `npm run test:coverage` to see detailed coverage reports. Coverage reports are generated in the `coverage/` directory and include:

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## Browser Testing

Playwright E2E tests run on multiple browsers:

- **Desktop:** Chrome, Firefox, Safari
- **Mobile:** Chrome (Pixel 5), Safari (iPhone 12)

## CI/CD Integration

These tests can be integrated into your GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build site
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
```

## Writing New Tests

### Unit Test Example

```javascript
describe('Feature Name', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### E2E Test Example

```javascript
test('should complete user action', async ({ page }) => {
  // Navigate to page
  await page.goto('/products/');
  
  // Interact with elements
  await page.click('button[data-action="buy"]');
  
  // Assert outcome
  await expect(page).toHaveURL('/checkout/');
});
```

## Troubleshooting

### Unit Tests Failing

- **localStorage errors**: Tests use mocked localStorage. Check jest.setup.js
- **DOM not available**: Make sure you're using `jsdom` test environment
- **Module not found**: Verify file paths and imports

### E2E Tests Failing

- **Connection refused**: Jekyll server must be running
- **Element not found**: Check selectors match actual HTML
- **Timeout errors**: Increase timeout in playwright.config.js
- **Browser not installed**: Run `npx playwright install`

### Running Tests in Debug Mode

```bash
# Jest with verbose output
npm test -- --verbose

# Playwright with debug mode
npx playwright test --debug

# Playwright with specific test file
npx playwright test e2e/cart.spec.js
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal implementation details

2. **Keep Tests Independent**
   - Each test should run in isolation
   - Use beforeEach/afterEach for setup/teardown

3. **Use Descriptive Names**
   - Test names should clearly describe what they test
   - Follow pattern: "should [expected behavior] when [condition]"

4. **Mock External Dependencies**
   - Use mocks for localStorage, API calls, etc.
   - Keep tests fast and reliable

5. **Test Edge Cases**
   - Empty states
   - Maximum/minimum values
   - Error conditions

6. **Maintain Test Coverage**
   - Aim for >80% coverage on critical paths
   - Focus on business logic and user workflows

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)

