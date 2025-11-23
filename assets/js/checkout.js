// Checkout functionality

// Configuration - Loaded from Jekyll config via inline script in HTML
const GOOGLE_SCRIPT_URL = window.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxq-bHQPOgC66nc--iE_q9B29YFbt_NWtofNJ2LHmEnFDPpfkP90d_5gY85-iwIZQsF/exec';

// Load cart and display order summary
document.addEventListener('DOMContentLoaded', function() {
  loadOrderSummary();
  setupFormHandlers();
});

function loadOrderSummary() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const summaryContainer = document.getElementById('orderSummaryItems');
  
  if (cart.length === 0) {
    summaryContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-400 mb-4">Vaša korpa je prazna</p>
        <a href="/proizvodi/" class="text-purple-400 hover:text-purple-300">
          Pogledajte proizvode →
        </a>
      </div>
    `;
    document.getElementById('submitOrderBtn').disabled = true;
    return;
  }

  let html = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    html += `
      <div class="flex gap-3 pb-4 border-b border-slate-600">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
        <div class="flex-1">
          <h4 class="font-semibold text-white text-sm">${item.name}</h4>
          <p class="text-xs text-gray-400">Količina: ${item.quantity}</p>
          <p class="text-sm font-bold text-gradient">${itemTotal.toLocaleString('sr-RS')} RSD</p>
        </div>
      </div>
    `;
  });

  summaryContainer.innerHTML = html;
  
  // Initial shipping calculation
  updateOrderTotals(subtotal);
  
  // Listen for shipping method changes
  document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
    radio.addEventListener('change', () => updateOrderTotals(subtotal));
  });
  
  // Listen for payment method changes
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => updateOrderTotals(subtotal));
  });
}

function updateOrderTotals(subtotal) {
  // Get selected shipping method
  const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked')?.value || 'standard';
  let shipping = 0;
  
  // Standard shipping costs 400 RSD, pickup is free
  if (shippingMethod === 'standard') {
    shipping = 400;
  } else if (shippingMethod === 'pickup') {
    shipping = 0;
  }
  
  // Get selected payment method - no COD fee (set to 0)
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'pouzecem';
  const codFee = 0; // No COD fee
  
  const total = subtotal + shipping + codFee;

  document.getElementById('subtotalAmount').textContent = subtotal.toLocaleString('sr-RS') + ' RSD';
  
  let shippingText = shipping === 0 ? 'Besplatna' : shipping.toLocaleString('sr-RS') + ' RSD';
  document.getElementById('shippingAmount').textContent = shippingText;
  
  document.getElementById('totalAmount').textContent = total.toLocaleString('sr-RS') + ' RSD';
}

function setupFormHandlers() {
  const form = document.getElementById('checkoutForm');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
      alert('Molimo prihvatite uslove korišćenja i politiku privatnosti.');
      return;
    }

    await submitOrder();
  });

  // Phone number formatting
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('381')) {
      value = '+' + value;
    } else if (value.startsWith('0')) {
      value = '+381' + value.substring(1);
    }
    e.target.value = value;
  });
}

async function submitOrder() {
  const submitBtn = document.getElementById('submitOrderBtn');
  const originalText = submitBtn.innerHTML;
  
  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Šaljem porudžbinu...
  `;

  try {
    const orderData = collectOrderData();
    
    // Validate Google Script URL is configured
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      throw new Error('Google Apps Script URL nije konfigurisan. Molimo kontaktirajte administratora.');
    }
    
    // Submit to Google Sheets
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    // Note: With 'no-cors' mode, we can't read the response
    // We assume success if no error was thrown
    
    // Save order to localStorage as backup
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.push({
      orderNumber: orderData.orderNumber,
      timestamp: orderData.timestamp,
      total: orderData.pricing.total,
      status: 'pending'
    });
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();

    // Show success modal with order number
    showSuccessModal(orderData.orderNumber);
    
    // Optional: Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderData.orderNumber,
        value: orderData.pricing.total,
        currency: 'RSD',
        items: orderData.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }

  } catch (error) {
    console.error('Error submitting order:', error);
    
    // Show user-friendly error message
    let errorMessage = 'Došlo je do greške prilikom slanja porudžbine.';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Nema internet konekcije. Molimo proverite vašu vezu i pokušajte ponovo.';
    } else if (error.message.includes('konfigurisan')) {
      errorMessage = error.message;
    }
    
    alert(errorMessage + '\n\nMolimo pokušajte ponovo ili nas kontaktirajte direktno na:\n📧 kontakt@ekoza.shop\n📱 +381 XX XXX XXXX');
    
    // Restore button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function collectOrderData() {
  const form = document.getElementById('checkoutForm');
  const formData = new FormData(form);
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Calculate totals
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  // Get shipping cost based on method
  const shippingMethod = formData.get('shippingMethod');
  let shipping = 0;
  
  // Standard shipping costs 400 RSD, pickup is free
  if (shippingMethod === 'standard') {
    shipping = 400;
  } else if (shippingMethod === 'pickup') {
    shipping = 0;
  }
  
  // Add COD fee if payment method is pouzecem (currently set to 0)
  const paymentMethod = formData.get('paymentMethod');
  const codFee = 0; // Set to 0 for now, can be configured later
  
  const total = subtotal + shipping + codFee;

  // Generate order number: EK + last 8 digits of timestamp
  const orderNumber = 'EK' + Date.now().toString().slice(-8);

  // Prepare order data
  const orderData = {
    orderNumber: orderNumber,
    timestamp: new Date().toISOString(),
    customer: {
      firstName: formData.get('firstName').trim(),
      lastName: formData.get('lastName').trim(),
      email: formData.get('email').trim().toLowerCase(),
      phone: formData.get('phone').trim()
    },
    shipping: {
      address: formData.get('address').trim(),
      city: formData.get('city').trim(),
      postalCode: formData.get('postalCode').trim(),
      country: formData.get('country').trim(),
      method: formData.get('shippingMethod')
    },
    paymentMethod: formData.get('paymentMethod'),
    notes: formData.get('notes')?.trim() || '',
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      color: item.color || null,
      size: item.size || null,
      image: item.image,
      url: item.url
    })),
    pricing: {
      subtotal: subtotal,
      shipping: shipping,
      codFee: codFee,
      total: total
    },
    status: 'pending'
  };

  return orderData;
}

function showSuccessModal(orderNumber) {
  document.getElementById('orderNumber').textContent = '#' + orderNumber;
  
  // Update tracking link
  const trackLink = document.getElementById('trackOrderLink');
  if (trackLink) {
    trackLink.href = `/pracenje-porudzbine/?orderNumber=${orderNumber}`;
  }
  
  document.getElementById('successModal').classList.remove('hidden');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update cart count in header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

// Show cart modal (if user wants to go back)
function showCart() {
  const cartModal = document.getElementById('cartModal');
  if (cartModal) {
    cartModal.classList.remove('hidden');
  } else {
    window.location.href = '/proizvodi/';
  }
}
