---
---
/**
 * Ekoza Shop Chat Integration
 * Integrates with the Chat API for customer support
 */

// Configuration - will be loaded from Jekyll config
const CHAT_CONFIG = {
  apiBaseUrl: '{{ site.chat.api_base_url }}',
  sharedSecret: '{{ site.chat.shared_secret }}',
  sessionStorageKey: '{{ site.chat.session_storage_key }}',
  maxMessageLength: {{ site.chat.max_message_length | default: 500 }},
  polling: {
    activeInterval: {{ site.chat.polling.active_interval | default: 5 }} * 1000,
    inactiveInterval: {{ site.chat.polling.inactive_interval | default: 15 }} * 1000,
    inactivityThreshold: {{ site.chat.polling.inactivity_threshold | default: 30 }} * 1000
  }
};
const chatState = {
  sessionId: null,
  isOpen: false,
  isActive: false,
  lastActivity: Date.now(),
  messages: [],
  pollInterval: null,
  unreadCount: 0,
  lastMessageId: null,
  userInfo: {
    fullName: '',
    email: '',
    phone: ''
  }
};

/**
 * Initialize chat on page load
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeChat();
});

/**
 * Initialize chat functionality
 */
async function initializeChat() {
  // Load session from localStorage
  loadSessionFromStorage();
  
  // Setup event listeners
  setupEventListeners();
  
  // If we have a session, prepare chat interface and load message history
  if (chatState.sessionId) {
    console.log('Existing session found, loading chat history...');
    
    // Replace contact form with empty chat ready for messages
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.innerHTML = '';
    }
    
    // Enable input
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    if (chatInput) chatInput.disabled = false;
    if (sendButton) sendButton.disabled = false;
    
    // Load all messages
    await loadAllMessages();
    
    // Start polling in background regardless of modal state
    startBackgroundPolling();
    
    console.log('Loaded', chatState.messages.length, 'messages');
  }
  
  console.log('Chat initialized. Session ID:', chatState.sessionId || 'None');
}

/**
 * Load session from localStorage
 */
function loadSessionFromStorage() {
  const sessionId = localStorage.getItem(CHAT_CONFIG.sessionStorageKey);
  
  if (sessionId) {
    chatState.sessionId = sessionId;
    console.log('Loaded session from storage:', sessionId);
  }
}

/**
 * Save session to localStorage
 */
function saveSessionToStorage() {
  if (chatState.sessionId) {
    localStorage.setItem(CHAT_CONFIG.sessionStorageKey, chatState.sessionId);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatButton = document.getElementById('chatButton');
  const closeChatButton = document.getElementById('closeChatButton');
  
  // Form submission
  if (chatForm) {
    chatForm.addEventListener('submit', handleSendMessage);
  }
  
  // Input changes
  if (chatInput) {
    chatInput.addEventListener('input', handleInputChange);
    chatInput.addEventListener('focus', handleChatActivity);
    chatInput.addEventListener('keypress', handleChatActivity);
  }
  
  // Close button click
  if (closeChatButton) {
    closeChatButton.addEventListener('click', toggleChat);
  }
  
  // Note: Chat button click is handled via onclick attribute in HTML
  
  // Track chat window activity
  const chatModal = document.getElementById('chatModal');
  if (chatModal) {
    chatModal.addEventListener('click', handleChatActivity);
    chatModal.addEventListener('mousemove', handleChatActivity);
  }
  
  // Track window visibility
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Track mouse/keyboard activity globally when chat is open
  window.addEventListener('mousemove', handleGlobalActivity);
  window.addEventListener('keypress', handleGlobalActivity);
}

/**
 * Handle chat activity
 */
function handleChatActivity() {
  chatState.lastActivity = Date.now();
  
  if (!chatState.isActive && chatState.isOpen) {
    chatState.isActive = true;
    console.log('Chat became active');
    adjustPollingInterval();
  }
}

/**
 * Handle global activity (only when chat is open)
 */
function handleGlobalActivity() {
  if (chatState.isOpen) {
    handleChatActivity();
  }
}

/**
 * Handle visibility change
 */
function handleVisibilityChange() {
  if (document.hidden) {
    chatState.isActive = false;
    adjustPollingInterval();
  } else if (chatState.isOpen) {
    chatState.isActive = true;
    handleChatActivity();
    adjustPollingInterval();
  }
}

/**
 * Check if chat is currently active
 */
function checkChatActivity() {
  const timeSinceLastActivity = Date.now() - chatState.lastActivity;
  const wasActive = chatState.isActive;
  
  chatState.isActive = chatState.isOpen && 
                       !document.hidden && 
                       timeSinceLastActivity < CHAT_CONFIG.polling.inactivityThreshold;
  
  if (wasActive !== chatState.isActive) {
    console.log('Chat activity changed:', chatState.isActive ? 'active' : 'inactive');
    adjustPollingInterval();
  }
}

/**
 * Start background polling (always runs every 5 seconds)
 */
function startBackgroundPolling() {
  if (chatState.pollInterval) return; // Already polling
  
  console.log('Starting background polling every 5 seconds');
  
  chatState.pollInterval = setInterval(() => {
    pollMessages();
  }, 5000); // Poll every 5 seconds
}

/**
 * Adjust polling interval based on activity
 */
function adjustPollingInterval() {
  // No longer needed, but keeping for compatibility
  if (!chatState.sessionId) return;
  
  stopPolling();
  startBackgroundPolling();
}

/**
 * Start polling for messages
 */
function startPolling() {
  // Redirect to background polling
  startBackgroundPolling();
}

/**
 * Stop polling for messages
 */
function stopPolling() {
  if (chatState.pollInterval) {
    clearInterval(chatState.pollInterval);
    chatState.pollInterval = null;
    console.log('Stopped polling');
  }
}

/**
 * Toggle chat modal
 */
function toggleChat() {
  console.log('toggleChat called');
  const chatModal = document.getElementById('chatModal');
  if (!chatModal) {
    console.error('Chat modal not found!');
    return;
  }
  
  chatState.isOpen = !chatState.isOpen;
  console.log('Chat state isOpen:', chatState.isOpen);
  
  if (chatState.isOpen) {
    chatModal.classList.remove('hidden');
    chatModal.classList.add('flex');
    chatState.isActive = true;
    handleChatActivity();
    
    // Clear unread count and update badge
    chatState.unreadCount = 0;
    updateBadge();
    
    // If no session, show contact form
    if (!chatState.sessionId) {
      console.log('No session, showing contact form');
      showContactForm();
    } else {
      console.log('Has session, showing chat interface');
      // Focus input
      const chatInput = document.getElementById('chatInput');
      if (chatInput) chatInput.focus();
      
      // Start background polling if we have a session
      if (!chatState.pollInterval) {
        startBackgroundPolling();
      }
    }
  } else {
    chatModal.classList.add('hidden');
    chatModal.classList.remove('flex');
    chatState.isActive = false;
  }
}

/**
 * Show contact form to start chat
 */
function showContactForm() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  chatMessages.innerHTML = `
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Započnite razgovor</h3>
      <p class="text-gray-300 text-sm mb-6">Molimo vas da unesete svoje podatke da bismo mogli da vam pomognemo.</p>
      
      <form id="contactForm" class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Ime i prezime *</label>
          <input type="text" id="fullName" required 
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Vaše ime i prezime">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email *</label>
          <input type="email" id="email" required 
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="vas.email@example.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Telefon *</label>
          <input type="tel" id="phone" required 
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="+381 64 123 4567">
        </div>
        <button type="submit" 
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium">
          Započni razgovor
        </button>
      </form>
    </div>
  `;
  
  // Setup form handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}

/**
 * Handle contact form submission
 */
async function handleContactFormSubmit(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName')?.value;
  const email = document.getElementById('email')?.value;
  const phone = document.getElementById('phone')?.value;
  
  if (!fullName || !email || !phone) {
    alert('Molimo vas da popunite sva polja.');
    return;
  }
  
  chatState.userInfo = { fullName, email, phone };
  
  // Start chat session
  await startChatSession();
}

/**
 * Start a new chat session
 */
async function startChatSession() {
  try {
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shared-secret': CHAT_CONFIG.sharedSecret
      },
      body: JSON.stringify({
        fullName: chatState.userInfo.fullName,
        email: chatState.userInfo.email,
        phone: chatState.userInfo.phone,
        page: window.location.href
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to start chat session');
    }
    
    const data = await response.json();
    
    if (data.ok && data.sessionId) {
      chatState.sessionId = data.sessionId;
      saveSessionToStorage();
      
      console.log('Chat session started:', data.sessionId);
      
      // Clear contact form and show chat interface
      showChatInterface();
      
      // Start background polling
      startBackgroundPolling();
      
      // Load all messages
      await loadAllMessages();
    } else {
      throw new Error('Invalid response from chat API');
    }
  } catch (error) {
    console.error('Error starting chat session:', error);
    alert('Nije moguće pokrenuti razgovor. Molimo vas pokušajte ponovo.');
  }
}

/**
 * Show chat interface
 */
function showChatInterface() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  chatMessages.innerHTML = '';
  
  // Enable input
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');
  
  if (chatInput) {
    chatInput.disabled = false;
    chatInput.focus();
  }
  if (sendButton) {
    sendButton.disabled = false;
  }
}

/**
 * Handle input change
 */
function handleInputChange(e) {
  const chatInput = e.target;
  const sendButton = document.getElementById('sendButton');
  const charCount = document.getElementById('charCount');
  
  if (sendButton) {
    sendButton.disabled = chatInput.value.trim().length === 0;
  }
  
  if (charCount) {
    charCount.textContent = `${chatInput.value.length}/${CHAT_CONFIG.maxMessageLength}`;
  }
  
  handleChatActivity();
}

/**
 * Handle send message
 */
async function handleSendMessage(e) {
  e.preventDefault();
  
  const chatInput = document.getElementById('chatInput');
  const message = chatInput?.value.trim();
  
  if (!message || !chatState.sessionId) return;
  
  // Clear input immediately
  chatInput.value = '';
  handleInputChange({ target: chatInput });
  
  // Add message to UI immediately
  addMessageToUI('user', message);
  
  // Send to API
  await sendMessageToAPI(message);
  
  handleChatActivity();
}

/**
 * Send message to API
 */
async function sendMessageToAPI(text) {
  try {
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shared-secret': CHAT_CONFIG.sharedSecret
      },
      body: JSON.stringify({
        sessionId: chatState.sessionId,
        text: text
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    const data = await response.json();
    
    if (data.ok && data.cursor) {
      chatState.cursor = data.cursor;
      saveSessionToStorage();
      
      // Poll immediately to get any responses
      setTimeout(() => pollMessages(), 500);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Add error message to UI
    addMessageToUI('system', 'Greška pri slanju poruke. Molimo vas pokušajte ponovo.');
  }
}

/**
 * Load all messages from /chat/all
 */
async function loadAllMessages() {
  if (!chatState.sessionId) {
    console.log('No session ID, skipping message load');
    return;
  }
  
  try {
    const url = `${CHAT_CONFIG.apiBaseUrl}/chat/all?sessionId=${chatState.sessionId}`;
    
    console.log('Loading all messages...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-shared-secret': CHAT_CONFIG.sharedSecret
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load all messages');
    }
    
    const data = await response.json();
    
    console.log('All messages response:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('Processing', data.length, 'messages');
      
      // Process all messages
      data.forEach(message => {
        processMessage(message);
      });
    } else {
      console.log('No messages found');
    }
  } catch (error) {
    console.error('Error loading all messages:', error);
  }
}

/**
 * Poll for new messages (returns last message only)
 */
async function pollMessages() {
  if (!chatState.sessionId) {
    console.log('No session ID, skipping poll');
    return;
  }
  
  try {
    const url = `${CHAT_CONFIG.apiBaseUrl}/chat/poll?sessionId=${chatState.sessionId}&ts=${Date.now()}`;
    
    console.log('Polling for new message...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-shared-secret': CHAT_CONFIG.sharedSecret
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to poll messages');
    }
    
    const data = await response.json();
    
    console.log('Poll response:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('Processing', data.length, 'new message(s)');
      data.forEach(message => {
        processMessage(message);
      });
    } else {
      console.log('No new messages');
    }
  } catch (error) {
    console.error('Error polling messages:', error);
  }
}

/**
 * Process a message from the API
 */
function processMessage(message) {
  // Check if we already have this message
  const exists = chatState.messages.find(m => m.id === message.id);
  if (exists) return;
  
  // Add to state
  chatState.messages.push(message);
  
  // Track last message ID
  chatState.lastMessageId = message.id;
  
  // Determine message type
  let type = 'system';
  if (message.source === 'web') {
    type = 'user';
  } else if (message.source === 'telegram' || message.source === 'agent') {
    type = 'bot';
  } else if (message.source === 'system') {
    type = 'system';
  }
  
  // Skip system messages about chat start
  if (message.source === 'system' && message.text.includes('Chat started')) {
    return;
  }
  
  // Increment unread count if modal is closed and it's a bot message
  if (!chatState.isOpen && type === 'bot') {
    chatState.unreadCount++;
    updateBadge();
  }
  
  // Add to UI
  addMessageToUI(type, message.text, message.from, message.ts || message.timestamp);
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (isToday) {
    return `${hours}:${minutes}`;
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}. ${hours}:${minutes}`;
  }
}

/**
 * Add message to UI
 */
function addMessageToUI(type, text, from = null, timestamp = null) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const timeStr = formatTimestamp(timestamp);
  
  const messageWrapper = document.createElement('div');
  
  if (type === 'user') {
    messageWrapper.className = 'w-full flex justify-end';
    const userName = chatState.userInfo.fullName || 'Vi';
    messageWrapper.innerHTML = `
      <div class="flex items-start space-x-2 flex-row-reverse space-x-reverse">
        <div class="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-xs text-gray-400 mb-1">${escapeHtml(userName)} ${timeStr ? `<span class="text-gray-500">• ${timeStr}</span>` : ''}</div>
          <div class="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-3 rounded-2xl rounded-tr-sm">
            ${escapeHtml(text)}
          </div>
        </div>
      </div>
    `;
  } else if (type === 'bot') {
    messageWrapper.className = 'w-full flex justify-start';
    const botName = from?.name || from?.first_name || from?.username || 'Podrška';
    messageWrapper.innerHTML = `
      <div class="flex items-start space-x-2">
        <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div class="flex flex-col items-start">
          <div class="text-xs text-gray-400 mb-1">${escapeHtml(botName)} ${timeStr ? `<span class="text-gray-500">• ${timeStr}</span>` : ''}</div>
          <div class="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-3 rounded-2xl rounded-tl-sm">
            ${escapeHtml(text)}
          </div>
        </div>
      </div>
    `;
  } else {
    // system message
    messageWrapper.className = 'w-full';
    messageWrapper.innerHTML = `
      <div class="w-full text-center">
        <div class="inline-block bg-slate-800/50 text-gray-400 px-4 py-2 rounded-full text-xs">
          ${escapeHtml(text)}
        </div>
      </div>
    `;
  }
  
  chatMessages.appendChild(messageWrapper);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Update badge count
 */
function updateBadge() {
  const badge = document.getElementById('chatBadge');
  if (!badge) return;
  
  if (chatState.unreadCount > 0) {
    badge.textContent = chatState.unreadCount > 99 ? '99+' : chatState.unreadCount.toString();
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

/**
 * Clear chat
 */
function clearChat() {
  if (!confirm('Da li ste sigurni da želite da obrišete razgovor?')) {
    return;
  }
  
  // Clear state
  chatState.sessionId = null;
  chatState.messages = [];
  chatState.lastMessageId = null;
  chatState.unreadCount = 0;
  
  // Clear storage
  localStorage.removeItem(CHAT_CONFIG.sessionStorageKey);
  
  // Stop polling
  stopPolling();
  
  // Clear UI
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  
  // Show contact form again
  showContactForm();
  
  console.log('Chat cleared');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions available globally
window.toggleChat = toggleChat;
window.clearChat = clearChat;
