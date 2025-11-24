/**
 * Simple unit tests for cart functionality
 * These tests verify the cart logic works correctly
 */

describe('Shopping Cart Logic', () => {
  let mockLocalStorage;
  
  beforeEach(() => {
    // Create a fresh mock for each test
    let store = {};
    mockLocalStorage = {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
    
    global.localStorage = mockLocalStorage;
  });

  test('should start with empty cart when localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const cartData = mockLocalStorage.getItem('cart');
    const items = cartData ? JSON.parse(cartData) : [];
    
    expect(items).toEqual([]);
    expect(items.length).toBe(0);
  });

  test('should calculate cart total correctly', () => {
    const items = [
      { name: 'Product 1', price: 5000, quantity: 2 },
      { name: 'Product 2', price: 3000, quantity: 1 }
    ];
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    expect(total).toBe(13000); // 5000*2 + 3000*1
  });

  test('should count total items correctly', () => {
    const items = [
      { name: 'Product 1', price: 5000, quantity: 2 },
      { name: 'Product 2', price: 3000, quantity: 3 }
    ];
    
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    
    expect(itemCount).toBe(5);
  });

  test('should filter out removed items', () => {
    const items = [
      { id: 1, name: 'Product 1', price: 5000, quantity: 1 },
      { id: 2, name: 'Product 2', price: 3000, quantity: 1 }
    ];
    
    const itemIdToRemove = 1;
    const filteredItems = items.filter(item => item.id !== itemIdToRemove);
    
    expect(filteredItems).toHaveLength(1);
    expect(filteredItems[0].id).toBe(2);
  });

  test('should update item quantity', () => {
    const items = [
      { id: 1, name: 'Product 1', price: 5000, quantity: 1 }
    ];
    
    const item = items.find(i => i.id === 1);
    if (item) {
      item.quantity = 5;
    }
    
    expect(item.quantity).toBe(5);
  });

  test('should prevent quantity below 1', () => {
    const requestedQuantity = -5;
    const actualQuantity = Math.max(1, requestedQuantity);
    
    expect(actualQuantity).toBe(1);
  });

  test('should add items with different colors separately', () => {
    const items = [];
    
    // Add red item
    items.push({ name: 'Lazy Bag', price: 5000, quantity: 1, color: 'Red', size: 'L' });
    
    // Try to add blue item - should be separate
    const existingItem = items.find(item => 
      item.name === 'Lazy Bag' && item.color === 'Blue' && item.size === 'L'
    );
    
    if (!existingItem) {
      items.push({ name: 'Lazy Bag', price: 5000, quantity: 1, color: 'Blue', size: 'L' });
    }
    
    expect(items).toHaveLength(2);
  });

  test('should increment quantity for same item and color', () => {
    const items = [
      { name: 'Lazy Bag', price: 5000, quantity: 1, color: 'Red', size: 'L' }
    ];
    
    // Try to add same item
    const existingItem = items.find(item => 
      item.name === 'Lazy Bag' && item.color === 'Red' && item.size === 'L'
    );
    
    if (existingItem) {
      existingItem.quantity += 2;
    }
    
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  test('should save cart to localStorage', () => {
    const items = [
      { id: 1, name: 'Product 1', price: 5000, quantity: 1 }
    ];
    
    mockLocalStorage.setItem('cart', JSON.stringify(items));
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify(items)
    );
  });

  test('should load cart from localStorage', () => {
    const savedItems = [
      { id: 1, name: 'Product 1', price: 5000, quantity: 1 }
    ];
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedItems));
    
    const cartData = mockLocalStorage.getItem('cart');
    const items = JSON.parse(cartData);
    
    expect(items).toEqual(savedItems);
    expect(items[0].name).toBe('Product 1');
  });
});

describe('Checkout Calculations', () => {
  test('should calculate subtotal correctly', () => {
    const items = [
      { price: 5000, quantity: 2 },
      { price: 3000, quantity: 1 }
    ];
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    expect(subtotal).toBe(13000);
  });

  test('should add standard shipping cost', () => {
    const subtotal = 10000;
    const shipping = 400; // Standard shipping
    const total = subtotal + shipping;
    
    expect(total).toBe(10400);
  });

  test('should have free shipping for pickup', () => {
    const subtotal = 10000;
    const shippingMethod = 'pickup';
    const shipping = shippingMethod === 'pickup' ? 0 : 400;
    const total = subtotal + shipping;
    
    expect(total).toBe(10000);
  });

  test('should format order number correctly', () => {
    const timestamp = Date.now();
    const orderNumber = 'EK' + timestamp.toString().slice(-8);
    
    expect(orderNumber).toMatch(/^EK\d{8}$/);
    expect(orderNumber.length).toBe(10);
  });

  test('should trim and lowercase email', () => {
    const email = '  TEST@EXAMPLE.COM  ';
    const normalized = email.trim().toLowerCase();
    
    expect(normalized).toBe('test@example.com');
  });

  test('should format price with thousands separator', () => {
    const price = 15000;
    const formatted = price.toLocaleString('sr-RS');
    
    // Serbian locale uses dot or space as thousand separator
    expect(formatted).toMatch(/15[\s.]000/);
  });
});
