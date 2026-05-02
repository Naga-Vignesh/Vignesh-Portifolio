/* ===========================================================
   chatbot.js — floating widget that calls /api/chat
   The Gemini API key lives only on the server (Vercel env var)
   =========================================================== */

(() => {
  'use strict';

  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const messagesEl = document.getElementById('chatMessages');
  const suggestEl = document.getElementById('chatSuggestions');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  if (!fab || !panel) return;

  // Conversation history sent to the server with each call
  const history = [];
  let busy = false;

  /* ---------- Open / close ---------- */
  const openPanel = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(() => input?.focus(), 250);
  };
  const closePanel = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  };

  fab.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn?.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  /* ---------- Suggested questions ---------- */
  suggestEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.suggest');
    if (!btn) return;
    const q = btn.dataset.q || btn.textContent.trim();
    sendMessage(q);
    suggestEl.remove();
  });

  /* ---------- Submit ---------- */
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    sendMessage(text);
    input.value = '';
    if (suggestEl?.parentNode) suggestEl.remove();
  });

  /* ---------- Render helpers ---------- */
  function appendMsg(role, text, className) {
    const div = document.createElement('div');
    div.className = `chat-msg ${className || role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }
  function appendTyping() {
    const t = document.createElement('div');
    t.className = 'chat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    t.id = 'chatTyping';
    messagesEl.appendChild(t);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function removeTyping() {
    document.getElementById('chatTyping')?.remove();
  }

  /* ---------- Core: send to /api/chat ---------- */
  async function sendMessage(message) {
    if (busy) return;
    busy = true;
    appendMsg('user', message);
    history.push({ role: 'user', content: message });
    appendTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: history.slice(-12) }),
      });

      removeTyping();

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const reply = (data && data.reply) || 'Sorry — no response.';
      appendMsg('ai', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeTyping();
      appendMsg(
        'ai',
        'I could not reach the assistant right now. Please try again, or email marnen88@rowan.edu.',
        'error'
      );
      console.error('[chatbot]', err);
    } finally {
      busy = false;
    }
  }
})();
