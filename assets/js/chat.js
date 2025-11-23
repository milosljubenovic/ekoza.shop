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
  unreadCount: 0,
  agents: [],
  selectedAgent: '', // empty = auto-routing
  agentHealth: {} // tracks agent availability from /health endpoint
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
  
  // Load available agents
  await loadAgents();
  
  // Check agent health status
  await checkAgentHealth();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load message history from storage or API
  await loadMessageHistory();
  
  console.log('Chat initialized. Session ID:', chatState.sessionId || 'None');
}

/**
 * Load available agents from API
 */
async function loadAgents() {
  try {
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      chatState.agents = data.agents || [];
      renderAgentSelector();
      console.log(`Loaded ${chatState.agents.length} agents`);
    }
  } catch (error) {
    console.error('Failed to load agents:', error);
    // Continue with default behavior (auto-routing)
  }
}

/**
 * Check agent health status from /health endpoint
 */
async function checkAgentHealth() {
  try {
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Store agent health status
      if (data.agents) {
        chatState.agentHealth = data.agents;
        console.log('Agent health status:', chatState.agentHealth);
      }
      
      // Re-render agent selector with health status
      renderAgentSelector();
      
      // Enable chat
      enableChat();
      
      return true;
    } else {
      // Health check failed
      console.error('Health check failed with status:', response.status);
      disableChat();
      return false;
    }
  } catch (error) {
    console.warn('Failed to check agent health:', error);
    // Disable chat when health check fails
    disableChat();
  }
  return false;
}

/**
 * Render agent selector in UI
 */
function renderAgentSelector() {
  const agentSelectorContainer = document.getElementById('agentSelector');
  if (!agentSelectorContainer || chatState.agents.length === 0) return;
  
  const select = document.createElement('select');
  select.id = 'agentSelect';
  select.className = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all';
  
  // Auto-routing option
  const autoOption = document.createElement('option');
  autoOption.value = '';
  autoOption.textContent = '🤖 Auto-odabir agenta';
  select.appendChild(autoOption);
  
  // Agent options
  chatState.agents.forEach(agent => {
    const option = document.createElement('option');
    option.value = agent.id;
    option.textContent = agent.name;
    select.appendChild(option);
  });
  
  select.addEventListener('change', (e) => {
    chatState.selectedAgent = e.target.value;
    console.log('Selected agent:', chatState.selectedAgent || 'auto');
  });
  
  agentSelectorContainer.innerHTML = '';
  agentSelectorContainer.appendChild(select);
}

/**
 * Load available agents from API
 */
async function loadAgents() {
  try {
    const response = await fetch(`${CHAT_CONFIG.apiBaseUrl}/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      chatState.agents = data.agents || [];
      renderAgentSelector();
      console.log(`Loaded ${chatState.agents.length} agents`);
    }
  } catch (error) {
    console.error('Failed to load agents:', error);
    // Continue with default behavior (auto-routing)
  }
}

/**
 * Render agent selector in UI
 */
function renderAgentSelector() {
  // Check if this is first visit (no session and no messages)
  const isFirstVisit = !chatState.sessionId && chatState.messageHistory.length === 0;
  
  if (isFirstVisit) {
    // Show Intercom-style agent cards
    renderAgentCards();
  } else {
    // Show dropdown selector for existing sessions
    renderAgentDropdown();
  }
}

/**
 * Render Intercom-style agent selection cards
 */
function renderAgentCards() {
  const agentWelcome = document.getElementById('agentWelcome');
  const agentCards = document.getElementById('agentCards');
  
  if (!agentWelcome || !agentCards || chatState.agents.length === 0) return;
  
  agentWelcome.classList.remove('hidden');
  agentCards.innerHTML = '';
  
  chatState.agents.forEach(agent => {
    // Check if agent is available
    const isAvailable = chatState.agentHealth[agent.id] !== false;
    const isDisabled = !isAvailable;
    
    const card = document.createElement('button');
    card.className = `w-full border rounded-xl p-4 text-left transition-all ${
      isDisabled 
        ? 'bg-slate-800/50 border-slate-700/50 opacity-50 cursor-not-allowed' 
        : 'bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border-slate-600 hover:scale-105 hover:shadow-lg'
    }`;
    
    if (!isDisabled) {
      card.onclick = () => selectAgentCard(agent.id, agent.name);
    }
    
    // Agent icon based on type
    const icons = {
      'general': '🤖',
      'orders': '🛒',
      'info': 'ℹ️',
      'tracking': '📦',
      'returns': '↩️'
    };
    const icon = icons[agent.id] || '💬';
    
    const statusBadge = isDisabled 
      ? '<span class="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Nedostupan</span>' 
      : '';
    
    card.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="text-3xl flex-shrink-0 ${ isDisabled ? 'grayscale' : '' }">${icon}</div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-bold text-white text-sm">${agent.name}</h4>
            ${statusBadge}
          </div>
          <p class="text-gray-300 text-xs">${agent.description}</p>
        </div>
      </div>
    `;
    
    agentCards.appendChild(card);
  });
}

/**
 * Handle agent card selection
 */
function selectAgentCard(agentId, agentName) {
  // Hide welcome screen
  const agentWelcome = document.getElementById('agentWelcome');
  if (agentWelcome) {
    agentWelcome.classList.add('hidden');
  }
  
  // Set selected agent
  chatState.selectedAgent = agentId;
  
  // Show agent selector dropdown
  const selectorContainer = document.getElementById('agentSelectorContainer');
  if (selectorContainer) {
    selectorContainer.classList.remove('hidden');
  }
  
  // Render dropdown and set value
  renderAgentDropdown();
  const select = document.getElementById('agentSelect');
  if (select) {
    select.value = agentId;
  }
  
  // Add system message
  addMessageToUI('bot', `Povezao sam vas sa: **${agentName}**. Kako mogu da vam pomognem?`);
  
  // Focus input
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.focus();
  }
  
  console.log('Agent selected from card:', agentId);
}

/**
 * Render agent dropdown selector
 */
function renderAgentDropdown() {
  const agentSelectorContainer = document.getElementById('agentSelectorContainer');
  const agentSelector = document.getElementById('agentSelector');
  if (!agentSelector || chatState.agents.length === 0) return;
  
  // Show container
  if (agentSelectorContainer) {
    agentSelectorContainer.classList.remove('hidden');
  }
  
  const select = document.createElement('select');
  select.id = 'agentSelect';
  select.className = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all';
  
  // Auto-routing option
  const autoOption = document.createElement('option');
  autoOption.value = '';
  autoOption.textContent = '🤖 Auto-odabir agenta';
  select.appendChild(autoOption);
  
  // Agent options
  chatState.agents.forEach(agent => {
    const option = document.createElement('option');
    option.value = agent.id;
    
    // Check if agent is available
    const isAvailable = chatState.agentHealth[agent.id] !== false;
    
    if (!isAvailable) {
      option.disabled = true;
      option.textContent = `${agent.name} (Nedostupan)`;
      option.style.opacity = '0.5';
    } else {
      option.textContent = agent.name;
    }
    
    option.title = agent.description;
    select.appendChild(option);
  });
  
  select.addEventListener('change', (e) => {
    chatState.selectedAgent = e.target.value;
    console.log('Selected agent:', chatState.selectedAgent || 'auto');
  });
  
  agentSelector.innerHTML = '';
  agentSelector.appendChild(select);
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
    
    // Add agent_id if manually selected
    if (chatState.selectedAgent) {
      requestBody.agent_id = chatState.selectedAgent;
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
    addMessageToUI('bot', data.response, false, null, data.agent_used);
    
    // Log which agent handled the message
    if (data.agent_used) {
      console.log('Agent used:', data.agent_used);
    }
    
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
function addMessageToUI(sender, text, isError = false, messageTimestamp = null, agentUsed = null) {
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
    
    // Find agent name if agentUsed is provided
    let agentBadge = '';
    if (agentUsed && chatState.agents.length > 0) {
      const agent = chatState.agents.find(a => a.id === agentUsed);
      if (agent) {
        agentBadge = `<span class="inline-block bg-purple-500/30 text-purple-200 text-xs px-2 py-0.5 rounded-full mr-2" title="${agent.description}">${agent.name}</span>`;
      }
    }
    
    messageDiv.innerHTML = `
      <div class="flex items-start space-x-2">
        <div class="w-8 h-8 bg-gradient-to-r ${iconColor} rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div class="message-bubble bot ${messageClass} text-white p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
          ${agentBadge}<p class="text-sm">${formatBotMessage(text)}</p>
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

/**
 * Disable chat when health check fails
 */
function disableChat() {
  const chatButton = document.getElementById('chatButton');
  const chatFab = chatButton?.querySelector('.chat-fab');
  
  if (chatButton && chatFab) {
    // Disable button
    chatFab.disabled = true;
    chatFab.onclick = null;
    
    // Add disabled styling
    chatFab.classList.add('opacity-50', 'cursor-not-allowed', 'grayscale');
    chatFab.classList.remove('hover:scale-110');
    
    // Update badge to show error
    const badge = document.getElementById('chatBadge');
    if (badge) {
      badge.textContent = '!';
      badge.classList.remove('bg-red-500', 'hidden');
      badge.classList.add('bg-yellow-500');
      badge.title = 'Chat je trenutno nedostupan';
    }
    
    console.log('Chat disabled due to health check failure');
  }
}

/**
 * Enable chat when health check succeeds
 */
function enableChat() {
  const chatButton = document.getElementById('chatButton');
  const chatFab = chatButton?.querySelector('.chat-fab');
  
  if (chatButton && chatFab) {
    // Enable button
    chatFab.disabled = false;
    chatFab.onclick = toggleChat;
    
    // Remove disabled styling
    chatFab.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
    chatFab.classList.add('hover:scale-110');
    
    // Reset badge
    const badge = document.getElementById('chatBadge');
    if (badge) {
      badge.classList.remove('bg-yellow-500');
      badge.classList.add('bg-red-500', 'hidden');
      badge.title = '';
    }
    
    console.log('Chat enabled');
  }
}

// Export functions for use in HTML
window.toggleChat = toggleChat;
window.clearChat = clearChat;
window.checkAPIHealth = checkAPIHealth;
window.checkAgentHealth = checkAgentHealth;
window.fetchSessionHistory = fetchSessionHistory;
window.updateBadgeCount = updateBadgeCount;
window.incrementBadge = incrementBadge;
window.selectAgentCard = selectAgentCard;
window.clearBadge = clearBadge;
