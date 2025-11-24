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
  const itemCountElement = document.getElementById('orderItemCount');
  
  // Update item count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (itemCountElement) {
    itemCountElement.textContent = totalItems === 1 ? '1 proizvod' : `${totalItems} proizvoda`;
  }
  
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
  
  // Phone number formatting
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
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

  // Setup messaging buttons
  const channels = window.CONTACT_CHANNELS || {
    viber: '381622220894',
    whatsapp: '381622220894',
    facebook: 'foteljicee',
    sms: '381622220894',
    call: '381622220894'
  };
  
  document.getElementById('orderViberBtn')?.addEventListener('click', () => handleOrderSubmit('viber', channels));
  document.getElementById('orderWhatsAppBtn')?.addEventListener('click', () => handleOrderSubmit('whatsapp', channels));
  document.getElementById('orderFacebookBtn')?.addEventListener('click', () => handleOrderSubmit('facebook', channels));
  document.getElementById('orderSMSBtn')?.addEventListener('click', () => handleOrderSubmit('sms', channels));
  document.getElementById('orderCallBtn')?.addEventListener('click', () => handleOrderSubmit('call', channels));
}

async function handleOrderSubmit(channel, channels) {
  const form = document.getElementById('checkoutForm');
  
  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const termsCheckbox = document.getElementById('terms');
  if (!termsCheckbox.checked) {
    alert('Molimo prihvatite uslove korišćenja i politiku privatnosti.');
    return;
  }

  try {
    const orderData = collectOrderData();
    const message = createWhatsAppMessage(orderData);
    
    // Save order to localStorage
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.push({
      orderNumber: orderData.orderNumber,
      timestamp: orderData.timestamp,
      total: orderData.pricing.total,
      status: 'pending',
      channel: channel
    });
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();

    // Create appropriate URL based on channel
    let url;
    switch(channel) {
      case 'viber':
        url = `viber://chat?number=%2B${channels.viber}&text=${encodeURIComponent(message)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/${channels.whatsapp}?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        // Copy message to clipboard
        try {
          navigator.clipboard.writeText(message);
          showFacebookInstructions(orderData.orderNumber);
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
          alert(`Vaša porudžbina ${orderData.orderNumber} je spremna!\n\nMolimo pošaljite sledeću poruku na Facebook:\n\n${message.substring(0, 200)}...`);
        }
        url = `https://m.me/${channels.facebook}`;
        break;
      case 'sms':
        url = `sms:+${channels.sms}?body=${encodeURIComponent(message)}`;
        break;
      case 'call':
        url = `tel:+${channels.call}`;
        alert(`Vaša porudžbina ${orderData.orderNumber} je spremna!\n\nMolimo spomenite broj porudžbine prilikom poziva.`);
        break;
    }
    
    // Open the URL
    if (channel !== 'facebook') {
      window.open(url, '_blank');
    }
    
    // Show success message (not for Facebook since we have custom modal)
    if (channel !== 'facebook') {
      setTimeout(() => {
        alert(`✅ Porudžbina ${orderData.orderNumber} je spremna!\n\nHvala vam na poverenju!`);
        window.location.href = '/';
      }, 500);
    }
    
    // Analytics
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
    alert('Došlo je do greške. Molimo pokušajte ponovo.');
  }
}

function showFacebookInstructions(orderNumber) {
  const modalHtml = `
    <div id="facebookInstructionsModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div class="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600 max-w-md w-full">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.001 2.002c-5.522 0-9.999 4.477-9.999 9.999 0 4.99 3.656 9.126 8.437 9.879v-6.988h-2.54v-2.891h2.54V9.798c0-2.508 1.493-3.891 3.776-3.891 1.094 0 2.24.195 2.24.195v2.459h-1.264c-1.24 0-1.628.772-1.628 1.563v1.875h2.771l-.443 2.891h-2.328v6.988C18.344 21.129 22 16.992 22 12.001c0-5.522-4.477-9.999-9.999-9.999z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Poruka kopirana! 📋</h2>
          <div class="bg-slate-900 rounded-xl p-3 mb-4">
            <p class="text-sm text-gray-400 mb-1">Broj porudžbine:</p>
            <p class="text-xl font-bold text-gradient">${orderNumber}</p>
          </div>
        </div>

        <div class="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 mb-6">
          <p class="text-white font-semibold mb-3">📌 Kako poslati porudžbinu:</p>
          <ol class="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>Kliknite na dugme <span class="font-bold text-white">"Otvori Facebook Messenger"</span></li>
            <li>Facebook Messenger će se otvoriti u novom prozoru</li>
            <li>Nalepite poruku (Ctrl+V ili držite i izaberite "Paste")</li>
            <li>Pošaljite poruku</li>
          </ol>
        </div>

        <div class="flex items-start gap-2 bg-green-900/30 border border-green-500/50 rounded-xl p-3 mb-6">
          <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="text-sm text-gray-300">
            Poruka sa svim detaljima porudžbine je već <span class="font-bold text-white">kopirana u clipboard</span>!
          </p>
        </div>

        <button onclick="this.closest('#facebookInstructionsModal').remove(); window.open('https://m.me/foteljicee', '_blank');"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:from-blue-700 hover:to-blue-600 hover:scale-[1.02] active:scale-[0.98] mb-3">
          Otvori Facebook Messenger
        </button>

        <button onclick="this.closest('#facebookInstructionsModal').remove(); window.location.href = '/';"
                class="w-full text-center text-gray-400 hover:text-gray-300 text-sm py-2 transition-colors">
          Otkaži i vrati se na početnu
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function createWhatsAppMessage(orderData) {
  let message = `🛍️ *NOVA PORUDŽBINA*\n\n`;
  message += `📝 Broj: *${orderData.orderNumber}*\n`;
  message += `📅 Datum: ${new Date(orderData.timestamp).toLocaleString('sr-RS')}\n\n`;
  
  message += `👤 *KUPAC*\n`;
  message += `Ime: ${orderData.customer.firstName} ${orderData.customer.lastName}\n`;
  message += `📧 Email: ${orderData.customer.email}\n`;
  message += `📱 Telefon: ${orderData.customer.phone}\n\n`;
  
  message += `📦 *ADRESA DOSTAVE*\n`;
  message += `${orderData.shipping.address}\n`;
  message += `${orderData.shipping.postalCode} ${orderData.shipping.city}\n`;
  message += `${orderData.shipping.country}\n\n`;
  
  message += `🚚 *DOSTAVA*\n`;
  message += `Način: ${orderData.shipping.method === 'standard' ? 'Brza Pošta' : 'Lično preuzimanje'}\n\n`;
  
  message += `💳 *PLAĆANJE*\n`;
  message += `Način: ${orderData.paymentMethod === 'pouzecem' ? 'Plaćanje pouzećem' : 'Uplata na račun'}\n\n`;
  
  message += `🛒 *PROIZVODI*\n`;
  orderData.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Cena: ${item.price.toLocaleString('sr-RS')} RSD\n`;
    message += `   Količina: ${item.quantity}\n`;
    if (item.color) message += `   Boja: ${item.color}\n`;
    if (item.size) message += `   Veličina: ${item.size}\n`;
    message += `   Ukupno: ${(item.price * item.quantity).toLocaleString('sr-RS')} RSD\n\n`;
  });
  
  message += `💰 *UKUPNO*\n`;
  message += `Međuzbir: ${orderData.pricing.subtotal.toLocaleString('sr-RS')} RSD\n`;
  message += `Dostava: ${orderData.pricing.shipping > 0 ? orderData.pricing.shipping.toLocaleString('sr-RS') + ' RSD' : 'Besplatno'}\n`;
  message += `*TOTAL: ${orderData.pricing.total.toLocaleString('sr-RS')} RSD*\n`;
  
  if (orderData.notes) {
    message += `\n📝 *NAPOMENA*\n${orderData.notes}`;
  }
  
  return message;
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
      country: 'Srbija', // Hardcoded since field is disabled
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
