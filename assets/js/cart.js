// Shopping Cart functionality with localStorage
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  loadCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  addItem(name, price, image, url, quantity = 1, color = null, size = null) {
    const existingItemIndex = this.items.findIndex(item => 
      item.name === name && item.color === color && item.size === size
    );

    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += quantity;
    } else {
      this.items.push({
        name,
        price,
        image,
        url,
        quantity,
        color,
        size,
        id: Date.now()
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showNotification('Proizvod je dodat u korpu!');
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveCart();
    this.updateCartUI();
  }

  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
      this.updateCartUI();
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartUI();
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  updateCartUI() {
    // Update cart count badge
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = this.getItemCount();
    }

    // Update cart items list
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartItems) return;

    if (this.items.length === 0) {
      if (emptyCart) emptyCart.style.display = 'block';
      cartItems.innerHTML = '';
      if (cartTotal) cartTotal.textContent = '0 RSD';
      return;
    }

    if (emptyCart) emptyCart.style.display = 'none';

    cartItems.innerHTML = this.items.map(item => `
      <div class="flex gap-4 mb-4 pb-4 border-b">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
        <div class="flex-1">
          <h3 class="font-semibold text-sm mb-1">
            <a href="${item.url}" class="hover:text-primary-600">${item.name}</a>
          </h3>
          ${item.color ? `<p class="text-xs text-gray-500">Boja: ${item.color}</p>` : ''}
          ${item.size ? `<p class="text-xs text-gray-500">Veličina: ${item.size}</p>` : ''}
          <div class="flex items-center gap-2 mt-2">
            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})" 
                    class="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm">-</button>
            <span class="text-sm">${item.quantity}</span>
            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})" 
                    class="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm">+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold text-primary-600">${item.price * item.quantity} RSD</p>
          <button onclick="cart.removeItem(${item.id})" 
                  class="text-red-500 hover:text-red-700 text-xs mt-2">Ukloni</button>
        </div>
      </div>
    `).join('');

    if (cartTotal) {
      cartTotal.textContent = `${this.getTotal().toLocaleString()} RSD`;
    }
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Global functions for use in HTML
function addToCart(name, price, image, url, quantity = 1) {
  // Get selected color and size if on product page
  const selectedColor = document.querySelector('.color-option.ring-2');
  const selectedSize = document.querySelector('.size-option.border-primary-600');
  const quantityInput = document.getElementById('quantity');

  const color = selectedColor ? selectedColor.dataset.color : null;
  const size = selectedSize ? selectedSize.dataset.size : null;
  const qty = quantityInput ? parseInt(quantityInput.value) : quantity;

  cart.addItem(name, price, image, url, qty, color, size);
}

function toggleCart() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

function closeCartIfClickedOutside(event) {
  if (event.target.id === 'cartModal') {
    toggleCart();
  }
}

function checkout() {
  if (cart.items.length === 0) {
    alert('Vaša korpa je prazna!');
    return;
  }

  // Redirect to checkout page
  window.location.href = '/porudzbina/';
}

// Make cart and functions globally accessible
window.cart = cart;
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.closeCartIfClickedOutside = closeCartIfClickedOutside;
window.checkout = checkout;
