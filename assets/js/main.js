// Main JavaScript functionality

// Theme toggle functionality
function toggleTheme() {
  const html = document.documentElement;
  const isDark = !html.classList.contains('light-mode');
  
  if (isDark) {
    html.classList.add('light-mode');
    localStorage.theme = 'light';
  } else {
    html.classList.remove('light-mode');
    localStorage.theme = 'dark';
  }
  
  updateThemeIcons();
}

function updateThemeIcons() {
  const html = document.documentElement;
  const isLight = html.classList.contains('light-mode');
  const darkIcon = document.getElementById('themeIconDark');
  const lightIcon = document.getElementById('themeIconLight');
  
  if (darkIcon && lightIcon) {
    if (isLight) {
      darkIcon.classList.remove('hidden');
      lightIcon.classList.add('hidden');
    } else {
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden');
    }
  }
}

// Make functions globally accessible
window.toggleTheme = toggleTheme;
window.updateThemeIcons = updateThemeIcons;

// Initialize theme icons on load
document.addEventListener('DOMContentLoaded', function() {
  updateThemeIcons();
});

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

// Search bar toggle
function toggleSearch() {
  const searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.classList.toggle('hidden');
    if (!searchBar.classList.contains('hidden')) {
      document.getElementById('searchInput').focus();
    }
  }
}

// Escape HTML special chars so user-controlled strings can't break out of attributes / inject markup.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Product search functionality
function searchProducts(event) {
  const rawTerm = event.target.value;
  const searchTerm = rawTerm.toLowerCase();
  const searchResults = document.getElementById('searchResults');

  if (searchTerm.length < 2) {
    searchResults.classList.add('hidden');
    return;
  }

  // Get products data from the script tag. The JSON producer in
  // _layouts/default.html emits {id, title, url, price, category, image, ...}
  // -- note `title` and `image` (singular), not `name` and `images[]`.
  const products = window.productsData || [];

  const results = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );

  if (results.length > 0) {
    searchResults.innerHTML = results.slice(0, 5).map(product => `
      <a href="${escapeHtml(product.url)}" class="block p-4 hover:bg-slate-700 border-b border-slate-600 transition-colors${product.in_stock ? '' : ' opacity-60'}">
        <div class="flex gap-3">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="w-16 h-16 object-cover rounded-lg border border-slate-600">
          <div class="flex-1">
            <h4 class="font-semibold text-white text-sm mb-1">${escapeHtml(product.title)}</h4>
            <p class="text-xs text-gray-400 mb-2">${escapeHtml(product.category)}</p>
            <p class="text-sm font-bold text-gradient">${escapeHtml(product.price)} RSD</p>
          </div>
          ${product.in_stock ? '' : '<span class="self-start bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">Rasprodato</span>'}
        </div>
      </a>
    `).join('');
    searchResults.classList.remove('hidden');
  } else {
    const noResults = document.createElement('div');
    noResults.className = 'p-4 text-center text-gray-400';
    noResults.textContent = `Nema rezultata za "${rawTerm}"`;
    searchResults.replaceChildren(noResults);
    searchResults.classList.remove('hidden');
  }
}

// Make functions globally accessible
window.toggleMobileMenu = toggleMobileMenu;
window.toggleSearch = toggleSearch;
window.searchProducts = searchProducts;

// toggleOrdersDropdown is defined inline in _includes/header.html so it's
// available before main.js loads (some buttons reference it during render).

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  const searchBar = document.getElementById('searchBar');
  const searchResults = document.getElementById('searchResults');
  const ordersDropdown = document.getElementById('ordersDropdown');
  
  if (searchBar && searchResults && !searchBar.contains(event.target)) {
    searchResults.classList.add('hidden');
  }
  
  // Close orders dropdown if clicking outside
  if (ordersDropdown && !ordersDropdown.contains(event.target)) {
    const ordersButton = event.target.closest('button[onclick="toggleOrdersDropdown()"]');
    if (!ordersButton) {
      ordersDropdown.classList.add('hidden');
    }
  }
});

// Smooth scroll to top
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show scroll to top button
window.addEventListener('scroll', function() {
  const scrollBtn = document.getElementById('scrollToTop');
  if (scrollBtn) {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.remove('hidden');
    } else {
      scrollBtn.classList.add('hidden');
    }
  }
});

// Format price with thousands separator
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load products data for search (if on pages with product data)
  const productsDataElement = document.getElementById('productsData');
  if (productsDataElement) {
    try {
      window.productsData = JSON.parse(productsDataElement.textContent);
    } catch (e) {
      console.error('Failed to parse products data', e);
    }
  }

  // Add loading animation to images
  const images = document.querySelectorAll('img[data-lazy]');
  images.forEach(img => {
    img.addEventListener('load', function() {
      this.classList.add('loaded');
    });
  });
});

// ESC key to close modals
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const cartModal = document.getElementById('cartModal');
    if (cartModal && !cartModal.classList.contains('hidden')) {
      toggleCart();
    }
  }
});
