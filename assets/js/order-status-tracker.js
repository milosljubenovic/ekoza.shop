// Order Status Tracker - Multi-order tracking with dropdown menu
// Tracks multiple orders and polls status every 5 minutes

class OrderStatusTracker {
  constructor() {
    this.pollingInterval = 5 * 60 * 1000; // 5 minutes
    this.intervalId = null;
    this.activeOrders = [];
    this.init();
  }

  init() {
    console.log('OrderStatusTracker initialized');
    
    // Load active orders from localStorage
    this.loadActiveOrders();
    
    console.log('Loaded orders:', this.activeOrders);
    
    // Start polling if we have active orders
    if (this.activeOrders.length > 0) {
      this.startTracking();
    }
    
    // Update badge count
    this.updateBadgeCount();
    
    // Listen for new orders
    window.addEventListener('orderPlaced', (event) => {
      this.addOrder(event.detail.orderId, event.detail.phone);
    });
  }

  loadActiveOrders() {
    const orderIds = localStorage.getItem('orderIds');
    if (orderIds && orderIds.trim()) {
      try {
        const ids = orderIds.split(',').map(id => id.trim()).filter(id => id);
        this.activeOrders = [];
        
        const now = Date.now();
        
        // Load each order's details
        ids.forEach(orderId => {
          const orderData = localStorage.getItem(`order_${orderId}`);
          if (orderData) {
            try {
              const order = JSON.parse(orderData);
              
              // Check if order is still relevant (not older than 7 days)
              const daysSinceOrder = (now - order.timestamp) / (1000 * 60 * 60 * 24);
              if (daysSinceOrder <= 7) {
                this.activeOrders.push(order);
              } else {
                // Clean up old order
                localStorage.removeItem(`order_${orderId}`);
              }
            } catch (e) {
              console.error(`Failed to parse order ${orderId}:`, e);
            }
          }
        });
        
        // Save cleaned list
        this.saveOrders();
      } catch (e) {
        console.error('Failed to parse order IDs:', e);
        this.activeOrders = [];
      }
    }
  }

  saveOrders() {
    // Save comma-separated order IDs
    const orderIds = this.activeOrders.map(o => o.orderId).join(',');
    localStorage.setItem('orderIds', orderIds);
    
    // Save individual order details
    this.activeOrders.forEach(order => {
      localStorage.setItem(`order_${order.orderId}`, JSON.stringify(order));
    });
  }

  addOrder(orderId, phone) {
    // Check if order already exists
    const existingIndex = this.activeOrders.findIndex(o => o.orderId === orderId);
    
    if (existingIndex >= 0) {
      // Update existing order
      this.activeOrders[existingIndex] = {
        orderId: orderId,
        phone: phone,
        timestamp: Date.now(),
        status: 'pending'
      };
    } else {
      // Add new order
      this.activeOrders.push({
        orderId: orderId,
        phone: phone,
        timestamp: Date.now(),
        status: 'pending'
      });
    }
    
    this.saveOrders();
    this.updateBadgeCount();
    this.startTracking();
  }

  startTracking() {
    // Initial fetch for all orders
    this.fetchAllOrderStatuses();
    
    // Poll every 5 minutes
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.fetchAllOrderStatuses();
    }, this.pollingInterval);
  }

  stopTracking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async fetchAllOrderStatuses() {
    if (this.activeOrders.length === 0) {
      this.stopTracking();
      return;
    }
    
    // Fetch status for each order
    const promises = this.activeOrders.map(order => this.fetchOrderStatus(order));
    await Promise.all(promises);
    
    // Update badge and dropdown
    this.updateBadgeCount();
  }

  async fetchOrderStatus(order) {
    try {
      const response = await fetch(
        `https://ekozashop-orders.7kqq5yynhz.workers.dev?order=${order.orderId}&phonenumber=${encodeURIComponent(order.phone)}`
      );
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.order) {
        this.updateOrderStatus(order.orderId, data.order);
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
    }
  }

  updateOrderStatus(orderId, orderData) {
    const orderIndex = this.activeOrders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) return;
    
    const previousStatus = this.activeOrders[orderIndex].status;
    this.activeOrders[orderIndex].status = orderData.status;
    this.activeOrders[orderIndex].lastUpdated = Date.now();
    
    // Save to localStorage
    this.saveOrders();
    
    // If status changed, show notification
    if (previousStatus !== orderData.status) {
      this.onStatusChange(orderId, previousStatus, orderData.status);
    }
  }

  updateBadgeCount() {
    const badge = document.getElementById('ordersCount');
    const ordersButton = document.getElementById('ordersButton');
    
    console.log('updateBadgeCount called, activeOrders:', this.activeOrders.length);
    console.log('Badge element:', badge);
    console.log('Button element:', ordersButton);
    
    if (!badge) {
      console.warn('ordersCount badge not found');
      return;
    }
    
    const activeCount = this.activeOrders.filter(order => 
      order.status !== 'delivered' && order.status !== 'cancelled'
    ).length;
    
    console.log('Active orders count:', activeCount);
    console.log('Total orders:', this.activeOrders.length);
    
    // Hide the entire orders button if no orders at all
    if (ordersButton) {
      if (this.activeOrders.length === 0) {
        console.log('Hiding button - no orders');
        ordersButton.classList.add('hidden');
      } else {
        console.log('Showing button - has orders');
        ordersButton.classList.remove('hidden');
      }
    }
    
    // Update badge count for active orders only
    if (activeCount > 0) {
      badge.textContent = activeCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  getOrdersDropdownHTML() {
    if (this.activeOrders.length === 0) {
      return `
        <div class="p-6 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <p class="text-gray-400 mb-2">Nemate aktivnih porudžbina</p>
          <a href="/proizvodi/" class="text-purple-400 hover:text-purple-300 text-sm">
            Pogledajte proizvode →
          </a>
        </div>
      `;
    }
    
    let html = '<div class="divide-y divide-slate-600">';
    
    // Sort by timestamp, newest first
    const sortedOrders = [...this.activeOrders].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedOrders.forEach(order => {
      const statusConfig = this.getStatusConfig(order.status);
      const date = new Date(order.timestamp).toLocaleDateString('sr-RS', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      html += `
        <a href="/pracenje-porudzbine/?order=${order.orderId}&phonenumber=${encodeURIComponent(order.phone)}" 
           class="block p-4 hover:bg-slate-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 ${statusConfig.bgColor} rounded-full flex items-center justify-center flex-shrink-0">
              ${statusConfig.icon}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-semibold text-white text-sm">${order.orderId}</span>
                <span class="text-xs text-gray-400">${date}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 ${statusConfig.dotColor} rounded-full"></div>
                <span class="text-xs text-gray-300">${statusConfig.title}</span>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </a>
      `;
    });
    
    html += '</div>';
    return html;
  }

  getStatusConfig(status) {
    const configs = {
      pending: {
        title: 'Primljena',
        description: 'Obrađujemo vašu porudžbinu',
        icon: '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        borderColor: 'border-yellow-500/50',
        dotColor: 'bg-yellow-400',
        progressColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        progress: 25
      },
      confirmed: {
        title: 'Potvrđena',
        description: 'Pakujemo vaše proizvode',
        icon: '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-500',
        borderColor: 'border-blue-500/50',
        dotColor: 'bg-blue-400',
        progressColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        progress: 50
      },
      shipped: {
        title: 'Poslata',
        description: 'Na putu ka vama',
        icon: '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>',
        bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
        borderColor: 'border-purple-500/50',
        dotColor: 'bg-purple-400',
        progressColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
        progress: 75
      },
      delivered: {
        title: 'Isporučena',
        description: 'Uživajte u vašoj kupovini! 🎉',
        icon: '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
        bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
        borderColor: 'border-green-500/50',
        dotColor: 'bg-green-400',
        progressColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
        progress: 100
      },
      cancelled: {
        title: 'Otkazana',
        description: 'Porudžbina je otkazana',
        icon: '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
        bgColor: 'bg-gradient-to-br from-red-500 to-rose-500',
        borderColor: 'border-red-500/50',
        dotColor: 'bg-red-400',
        progressColor: 'bg-gradient-to-r from-red-500 to-rose-500',
        progress: 100
      }
    };
    
    return configs[status] || configs.pending;
  }

  onStatusChange(orderId, oldStatus, newStatus) {
    // Show browser notification if permissions are granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const statusConfig = this.getStatusConfig(newStatus);
      new Notification(`Porudžbina ${orderId}`, {
        body: `${statusConfig.title}: ${statusConfig.description}`,
        icon: '/assets/favicons/android-chrome-192x192.png',
        tag: 'order-status-' + orderId
      });
    }
  }

  removeOrder(orderId) {
    this.activeOrders = this.activeOrders.filter(o => o.orderId !== orderId);
    
    // Remove individual order data
    localStorage.removeItem(`order_${orderId}`);
    
    this.saveOrders();
    this.updateBadgeCount();
    
    if (this.activeOrders.length === 0) {
      this.stopTracking();
      // Clear the orderIds key if no orders left
      localStorage.removeItem('orderIds');
    }
  }
}

// Initialize the tracker when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.orderStatusTracker = new OrderStatusTracker();
  });
} else {
  window.orderStatusTracker = new OrderStatusTracker();
}
