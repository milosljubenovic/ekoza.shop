/**
 * Ekoza Shop Chat Integration
 * Integrates with the Ekoza Shop Chat API
 */

// Configuration
const CHAT_CONFIG = {
  // Change to your production URL when deploying
  apiBaseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8000' 
    : 'https://your-production-url.com',
  sessionStorageKey: 'ekoza_session_id',
  maxMessageLength: 500,
  apiTimeout: 30000 // 30 seconds
};

// Chat State
const chatState = {
  sessionId: null,
  isOpen: false,
  isLoading: false,
  messageHistory: [],
  unreadCount: 0
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
  // Load session from storage
  loadSession();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load message history from storage or API
  await loadMessageHistory();
  
  console.log('Chat initialized. Session ID:', chatState.sessionId || 'None');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatModal = document.getElementById('chatModal');
  
  // Form submission
  if (chatForm) {
    chatForm.addEventListener('submit', handleSendMessage);
  }
  
  // Character counter
  if (chatInput) {
    chatInput.addEventListener('input', updateCharacterCount);
    chatInput.addEventListener('input', toggleSendButton);
  }
  
  // Close modal on backdrop click
  if (chatModal) {
    chatModal.addEventListener('click', function(e) {
      if (e.target === chatModal) {
        toggleChat();
      }
    });
  }
  
  // ESC key to close chat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && chatState.isOpen) {
      toggleChat();
    }
  });
}

/**
 * Toggle chat modal visibility
 */
async function toggleChat() {
  const chatModal = document.getElementById('chatModal');
  const chatButton = document.getElementById('chatButton');
  
  if (!chatModal) return;
  
  chatState.isOpen = !chatState.isOpen;
  
  if (chatState.isOpen) {
    chatModal.classList.remove('hidden');
    chatModal.classList.add('flex');
    chatButton?.classList.add('hidden');
    
    // Load history when opening (if not already loaded)
    if (chatState.sessionId && chatState.messageHistory.length === 0) {
      await fetchSessionHistory();
    }
    
    // Focus input
    setTimeout(() => {
      document.getElementById('chatInput')?.focus();
    }, 100);
    
    // Clear badge count when opening chat
    clearBadge();
    
    // Scroll to bottom
    scrollToBottom();
  } else {
    chatModal.classList.add('hidden');
    chatModal.classList.remove('flex');
    chatButton?.classList.remove('hidden');
  }
}

/**
 * Handle message sending
 */
async function handleSendMessage(e) {
  e.preventDefault();
  
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message || chatState.isLoading) return;
  
  // Clear input immediately
  input.value = '';
  updateCharacterCount();
  toggleSendButton();
  
  // Add user message to UI
  addMessageToUI('user', message);
  
  // Send to API
  await sendMessageToAPI(message);
}

/**
 * Send message to API
 */
async function sendMessageToAPI(message) {
  chatState.isLoading = true;
  showTypingIndicator();
  setStatus('Piše...');
  
  try {
    const requestBody = {
      message: message
    };
    
    // Add session_id if exists
    if (chatState.sessionId) {
      requestBody.session_id = chatState.sessionId;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_CONFIG.apiTimeout);
    
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Session not found, clear and retry
        console.log('Session not found, starting new session');
        clearSession();
        await sendMessageToAPI(message);
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save session ID
    if (data.session_id) {
      saveSession(data.session_id);
    }
    
    // Add bot response to UI
    addMessageToUI('bot', data.response);
    
    // Increment badge if chat is closed
    if (!chatState.isOpen) {
      incrementBadge();
    }
    
    setStatus('Online');
    
  } catch (error) {
    console.error('Chat API Error:', error);
    
    let errorMessage = 'Greška u komunikaciji. Molimo pokušajte ponovo.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Zahtev je istekao. Molimo pokušajte ponovo.';
    } else if (!navigator.onLine) {
      errorMessage = 'Nema internet konekcije. Proverite vašu mrežu.';
    }
    
    addMessageToUI('bot', errorMessage, true);
    setStatus('Greška');
    
  } finally {
    chatState.isLoading = false;
    hideTypingIndicator();
  }
}

/**
 * Add message to UI
 */
function addMessageToUI(sender, text, isError = false, messageTimestamp = null) {
  const messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}-message fade-in`;
  
  // Use provided timestamp or create new one
  let timestamp;
  if (messageTimestamp) {
    // Parse ISO timestamp from API
    const date = new Date(messageTimestamp);
    timestamp = date.toLocaleTimeString('sr-RS', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    timestamp = new Date().toLocaleTimeString('sr-RS', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  if (sender === 'user') {
    messageDiv.innerHTML = `
      <div class="flex items-start space-x-2 justify-end">
        <div class="message-bubble user bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
          <p class="text-sm">${escapeHtml(text)}</p>
          <span class="text-xs opacity-75 mt-1 block">${timestamp}</span>
        </div>
        <div class="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
      </div>
    `;
  } else {
    const messageClass = isError ? 'bg-red-500/20 border border-red-500/50' : 'bg-gradient-to-br from-slate-800 to-slate-700';
    const iconColor = isError ? 'from-red-500 to-red-600' : 'from-purple-500 to-pink-500';
    
    messageDiv.innerHTML = `
      <div class="flex items-start space-x-2">
        <div class="w-8 h-8 bg-gradient-to-r ${iconColor} rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div class="message-bubble bot ${messageClass} text-white p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
          <p class="text-sm">${formatBotMessage(text)}</p>
          <span class="text-xs opacity-75 mt-1 block">${timestamp}</span>
        </div>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
  
  // Save to history
  chatState.messageHistory.push({ sender, text, timestamp: Date.now() });
  saveMessageHistory();
  
  // Scroll to bottom
  scrollToBottom();
}

/**
 * Format bot message (support basic markdown-like formatting)
 */
function formatBotMessage(text) {
  let formatted = escapeHtml(text);
  
  // Bold: **text**
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic: *text*
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Links (if any)
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" class="underline hover:text-purple-300">$1</a>'
  );
  
  return formatted;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.remove('hidden');
    scrollToBottom();
  }
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.add('hidden');
  }
}

/**
 * Update character counter
 */
function updateCharacterCount() {
  const input = document.getElementById('chatInput');
  const counter = document.getElementById('charCount');
  
  if (input && counter) {
    const length = input.value.length;
    counter.textContent = `${length}/${CHAT_CONFIG.maxMessageLength}`;
    
    if (length > CHAT_CONFIG.maxMessageLength * 0.9) {
      counter.classList.add('text-red-400');
    } else {
      counter.classList.remove('text-red-400');
    }
  }
}

/**
 * Toggle send button based on input
 */
function toggleSendButton() {
  const input = document.getElementById('chatInput');
  const button = document.getElementById('sendButton');
  
  if (input && button) {
    const hasText = input.value.trim().length > 0;
    button.disabled = !hasText || chatState.isLoading;
  }
}

/**
 * Set chat status
 */
function setStatus(status) {
  const statusElement = document.getElementById('chatStatus');
  if (statusElement) {
    statusElement.textContent = status;
  }
}

/**
 * Scroll messages to bottom
 */
function scrollToBottom() {
  const messagesContainer = document.getElementById('chatMessages');
  if (messagesContainer) {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
}

/**
 * Clear chat conversation
 */
function clearChat() {
  if (!confirm('Da li ste sigurni da želite da obrišete razgovor?')) {
    return;
  }
  
  const messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;
  
  // Clear UI (keep welcome message)
  const messages = messagesContainer.querySelectorAll('.chat-message');
  messages.forEach((msg, index) => {
    if (index > 0) { // Skip welcome message
      msg.remove();
    }
  });
  
  // Clear session and history
  clearSession();
  chatState.messageHistory = [];
  localStorage.removeItem('ekoza_chat_history');
  
  console.log('Chat cleared');
}

/**
 * Save session ID
 */
function saveSession(sessionId) {
  chatState.sessionId = sessionId;
  localStorage.setItem(CHAT_CONFIG.sessionStorageKey, sessionId);
  console.log('Session saved:', sessionId);
}

/**
 * Load session ID
 */
function loadSession() {
  const sessionId = localStorage.getItem(CHAT_CONFIG.sessionStorageKey);
  if (sessionId) {
    chatState.sessionId = sessionId;
    console.log('Session loaded:', sessionId);
  }
}

/**
 * Clear session
 */
function clearSession() {
  chatState.sessionId = null;
  localStorage.removeItem(CHAT_CONFIG.sessionStorageKey);
  console.log('Session cleared');
}

/**
 * Save message history
 */
function saveMessageHistory() {
  try {
    // Keep only last 20 messages
    const historyToSave = chatState.messageHistory.slice(-20);
    localStorage.setItem('ekoza_chat_history', JSON.stringify(historyToSave));
  } catch (e) {
    console.error('Failed to save message history:', e);
  }
}

/**
 * Load message history
 */
async function loadMessageHistory() {
  // First, try to load from API if we have a session
  if (chatState.sessionId) {
    const historyLoaded = await fetchSessionHistory();
    if (historyLoaded) {
      console.log('Loaded message history from API');
      return;
    }
  }
  
  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('ekoza_chat_history');
    if (saved) {
      chatState.messageHistory = JSON.parse(saved);
      
      // Restore messages to UI (skip if too old, e.g., > 24 hours)
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const recentMessages = chatState.messageHistory.filter(msg => msg.timestamp > oneDayAgo);
      
      if (recentMessages.length > 0 && recentMessages.length !== chatState.messageHistory.length) {
        chatState.messageHistory = recentMessages;
        saveMessageHistory();
      }
    }
  } catch (e) {
    console.error('Failed to load message history:', e);
  }
}

/**
 * Fetch session history from API
 */
async function fetchSessionHistory() {
  if (!chatState.sessionId) {
    return false;
  }
  
  try {
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/history/${chatState.sessionId}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Session history not found, starting fresh');
        clearSession();
        return false;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear existing UI messages (except welcome message)
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
      const messages = messagesContainer.querySelectorAll('.chat-message');
      messages.forEach((msg, index) => {
        if (index > 0) { // Keep welcome message
          msg.remove();
        }
      });
    }
    
    // Add messages from API to UI
    if (data.messages && data.messages.length > 0) {
      data.messages.forEach(msg => {
        const sender = msg.role === 'user' ? 'user' : 'bot';
        addMessageToUI(sender, msg.content, false, msg.timestamp);
      });
      
      console.log(`Loaded ${data.total_messages} messages from API`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Failed to fetch session history:', error);
    return false;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show notification (when chat is closed)
 */
function showChatNotification() {
  const badge = document.getElementById('chatBadge');
  if (badge && !chatState.isOpen) {
    badge.classList.remove('hidden');
  }
}

/**
 * Update badge count
 */
function updateBadgeCount(count) {
  const badge = document.getElementById('chatBadge');
  if (badge) {
    chatState.unreadCount = count;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count.toString();
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

/**
 * Increment badge count
 */
function incrementBadge() {
  if (!chatState.isOpen) {
    updateBadgeCount(chatState.unreadCount + 1);
  }
}

/**
 * Clear badge count
 */
function clearBadge() {
  updateBadgeCount(0);
}

/**
 * Check API health (optional)
 */
async function checkAPIHealth() {
  try {
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Health:', data);
      return true;
    }
  } catch (error) {
    console.warn('API health check failed:', error);
  }
  return false;
}

// Export functions for use in HTML
window.toggleChat = toggleChat;
window.clearChat = clearChat;
window.checkAPIHealth = checkAPIHealth;
window.fetchSessionHistory = fetchSessionHistory;
window.updateBadgeCount = updateBadgeCount;
window.incrementBadge = incrementBadge;
window.clearBadge = clearBadge;
