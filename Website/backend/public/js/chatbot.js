document.addEventListener('DOMContentLoaded', () => {

  const toggleBtn = document.getElementById('chatbotToggleBtn');
  const chatWindow = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotCloseBtn');
  const messagesArea = document.getElementById('chatbotMessages');
  const inputEl = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSendBtn');
  const suggestionContainer = document.getElementById('chatbotSuggestions');

  // Load chat memory if stored in sessionStorage
  const sessionChat = sessionStorage.getItem('fraudx_chat');
  if (sessionChat) {
    messagesArea.innerHTML = sessionChat;
    scrollToBottom();
  }

  // Toggle chat window
  function toggleChat() {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      inputEl.focus();
      scrollToBottom();
    }
  }

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // Send Message Logic
  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    
    appendUserMessage(text);
    inputEl.value = '';

    showTypingIndicator();

    fetch('/chatbot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
      removeTypingIndicator();
      if (data.error) {
        appendBotMessage(`Error: ${data.error}`);
      } else {
        appendBotMessage(data.text);
        updateSuggestions(data.actions);
      }
    })
    .catch(err => {
      removeTypingIndicator();
      console.error(err);
      appendBotMessage("Sorry, I'm experiencing network issues connecting to the AI system.");
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Handle Quick Suggestions
  suggestionContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-chip')) {
      inputEl.value = e.target.textContent;
      sendMessage();
    }
  });

  // Helpers
  function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-bubble user-bubble slide-up';
    div.innerHTML = `<div class="bubble-content">${escapeHTML(text)}</div>`;
    messagesArea.appendChild(div);
    scrollToBottom();
    saveChat();
  }

  function appendBotMessage(html) {
    const div = document.createElement('div');
    div.className = 'chat-bubble bot-bubble slide-up';
    div.innerHTML = `<div class="bubble-content">${html}</div>`;
    messagesArea.appendChild(div);
    scrollToBottom();
    saveChat();
  }

  function showTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'typingIndicator';
    div.className = 'typing-indicator';
    div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    messagesArea.appendChild(div);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  function updateSuggestions(actions) {
    suggestionContainer.innerHTML = '';
    if (actions && actions.length > 0) {
      actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-chip';
        btn.textContent = action;
        suggestionContainer.appendChild(btn);
      });
    }
  }

  function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function saveChat() {
    sessionStorage.setItem('fraudx_chat', messagesArea.innerHTML);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag])
    );
  }
});
