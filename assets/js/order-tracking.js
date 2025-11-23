// Order Tracking functionality

// Configuration - Loaded from Jekyll config via inline script in HTML
const GOOGLE_SCRIPT_URL = window.GOOGLE_SCRIPT_URL

// Status configurations
const statusConfig = {
  'pending': {
    label: 'Na Čekanju',
    color: 'bg-yellow-500',
    icon: '⏳',
    description: 'Vaša porudžbina je primljena i čeka na obradu.'
  },
  'processing': {
    label: 'U Obradi',
    color: 'bg-blue-500',
    icon: '📦',
    description: 'Vaša porudžbina se trenutno priprema za slanje.'
  },
  'shipped': {
    label: 'Poslato',
    color: 'bg-purple-500',
    icon: '🚚',
    description: 'Vaša porudžbina je poslata i uskoro će stići.'
  },
  'delivered': {
    label: 'Dostavljeno',
    color: 'bg-green-500',
    icon: '✅',
    description: 'Vaša porudžbina je uspešno dostavljena.'
  },
  'cancelled': {
    label: 'Otkazano',
    color: 'bg-red-500',
    icon: '❌',
    description: 'Ova porudžbina je otkazana.'
  }
};

// Timeline steps
const timelineSteps = [
  { id: 'pending', label: 'Primljeno' },
  { id: 'processing', label: 'U Pripremi' },
  { id: 'shipped', label: 'Poslato' },
  { id: 'delivered', label: 'Dostavljeno' }
];

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('trackOrderForm');
  form.addEventListener('submit', handleTrackOrder);

  // Check if order number is in URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('orderNumber');
  if (orderNumber) {
    document.getElementById('orderNumber').value = orderNumber;
    trackOrder(orderNumber);
  }
});

async function handleTrackOrder(e) {
  e.preventDefault();
  
  const orderNumber = document.getElementById('orderNumber').value.trim().toUpperCase();
  
  if (!orderNumber) {
    alert('Molimo unesite broj porudžbine');
    return;
  }

  // Validate format (EK + 8 digits)
  if (!/^EK\d{8}$/.test(orderNumber)) {
    alert('Format broja porudžbine mora biti: EK12345678');
    return;
  }

  await trackOrder(orderNumber);
}

async function trackOrder(orderNumber) {
  // Show loading
  showLoading();

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?orderNumber=${orderNumber}`);
    const data = await response.json();

    if (data.found) {
      showOrderFound(data);
    } else {
      showOrderNotFound();
    }

  } catch (error) {
    console.error('Error tracking order:', error);
    showOrderError();
  }
}

function showLoading() {
  const resultDiv = document.getElementById('orderStatusResult');
  if (!resultDiv) return;
  
  resultDiv.classList.remove('hidden');
  
  // Hide all states
  const orderFound = document.getElementById('orderFound');
  const orderNotFound = document.getElementById('orderNotFound');
  const orderError = document.getElementById('orderError');
  
  if (orderFound) orderFound.classList.add('hidden');
  if (orderNotFound) orderNotFound.classList.add('hidden');
  if (orderError) orderError.classList.add('hidden');
  
  // Create or update loading div
  let loadingDiv = document.getElementById('orderLoading');
  if (!loadingDiv) {
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'orderLoading';
    resultDiv.appendChild(loadingDiv);
  }
  
  loadingDiv.className = 'bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600 text-center';
  loadingDiv.innerHTML = `
    <svg class="animate-spin h-12 w-12 mx-auto mb-4 text-purple-400" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="text-white text-lg">Pretražujem porudžbinu...</p>
  `;
  loadingDiv.classList.remove('hidden');
}

function showOrderFound(data) {
  const resultDiv = document.getElementById('orderStatusResult');
  if (!resultDiv) return;
  
  resultDiv.classList.remove('hidden');
  
  // Hide loading
  const loadingDiv = document.getElementById('orderLoading');
  if (loadingDiv) loadingDiv.classList.add('hidden');
  
  // Show order found section
  const orderFoundDiv = document.getElementById('orderFound');
  const orderNotFound = document.getElementById('orderNotFound');
  const orderError = document.getElementById('orderError');
  
  if (orderFoundDiv) orderFoundDiv.classList.remove('hidden');
  if (orderNotFound) orderNotFound.classList.add('hidden');
  if (orderError) orderError.classList.add('hidden');
  
  // Update order details
  document.getElementById('orderNumberDisplay').textContent = data.orderNumber;
  document.getElementById('orderDate').textContent = formatDate(data.date);
  document.getElementById('customerName').textContent = data.customerName;
  document.getElementById('orderTotal').textContent = formatCurrency(data.total);
  
  // Update status
  const status = data.status || 'pending';
  const config = statusConfig[status] || statusConfig['pending'];
  
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.className = `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${config.color} text-white`;
  statusBadge.querySelector('span:last-child').textContent = config.icon + ' ' + config.label;
  
  document.getElementById('statusDescription').textContent = config.description;
  
  // Build timeline
  buildTimeline(status);
  
  // Scroll to result
  setTimeout(() => {
    orderFoundDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function showOrderNotFound() {
  const resultDiv = document.getElementById('orderStatusResult');
  if (!resultDiv) return;
  
  resultDiv.classList.remove('hidden');
  
  // Hide loading
  const loadingDiv = document.getElementById('orderLoading');
  if (loadingDiv) loadingDiv.classList.add('hidden');
  
  const orderFound = document.getElementById('orderFound');
  const orderNotFound = document.getElementById('orderNotFound');
  const orderError = document.getElementById('orderError');
  
  if (orderFound) orderFound.classList.add('hidden');
  if (orderNotFound) orderNotFound.classList.remove('hidden');
  if (orderError) orderError.classList.add('hidden');
  
  // Scroll to result
  setTimeout(() => {
    document.getElementById('orderNotFound').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function showOrderError() {
  const resultDiv = document.getElementById('orderStatusResult');
  if (!resultDiv) return;
  
  resultDiv.classList.remove('hidden');
  
  // Hide loading
  const loadingDiv = document.getElementById('orderLoading');
  if (loadingDiv) loadingDiv.classList.add('hidden');
  
  const orderFound = document.getElementById('orderFound');
  const orderNotFound = document.getElementById('orderNotFound');
  const orderError = document.getElementById('orderError');
  
  if (orderFound) orderFound.classList.add('hidden');
  if (orderNotFound) orderNotFound.classList.add('hidden');
  if (orderError) orderError.classList.remove('hidden');
  
  // Scroll to result
  setTimeout(() => {
    document.getElementById('orderError').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function buildTimeline(currentStatus) {
  const timeline = document.getElementById('statusTimeline');
  const currentIndex = timelineSteps.findIndex(step => step.id === currentStatus);
  
  let html = '';
  
  timelineSteps.forEach((step, index) => {
    const isCompleted = index <= currentIndex;
    const isCurrent = index === currentIndex;
    const isLast = index === timelineSteps.length - 1;
    
    html += `
      <div class="flex items-start gap-4">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full flex items-center justify-center ${
            isCompleted 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-slate-700 border-2 border-slate-600'
          }">
            ${isCompleted 
              ? '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
              : '<div class="w-3 h-3 rounded-full bg-slate-500"></div>'
            }
          </div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 pb-8">
          <h4 class="text-lg font-bold ${isCompleted ? 'text-white' : 'text-gray-400'} mb-1">
            ${step.label}
          </h4>
          <p class="text-sm ${isCompleted ? 'text-gray-300' : 'text-gray-500'}">
            ${statusConfig[step.id].description}
          </p>
          ${isCurrent ? '<span class="inline-block mt-2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">Trenutni status</span>' : ''}
        </div>
        
        <!-- Connector Line -->
        ${!isLast ? `
          <div class="absolute left-6 w-0.5 h-16 mt-12 ${isCompleted ? 'bg-gradient-to-b from-purple-500 to-pink-500' : 'bg-slate-700'}"></div>
        ` : ''}
      </div>
    `;
  });
  
  timeline.innerHTML = html;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('sr-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(amount) {
  return Number(amount).toLocaleString('sr-RS') + ' RSD';
}
