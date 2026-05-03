/* ============================================================
   chatbot.js — Floating widget calling /api/chat
   API key never exposed to frontend.
   ============================================================ */

(() => {
  'use strict';

  const fab        = document.getElementById('chatFab');
  const panel      = document.getElementById('chatPanel');
  const closeBtn   = document.getElementById('chatClose');
  const messages   = document.getElementById('chatMessages');
  const suggestEl  = document.getElementById('chatSuggestions');
  const form       = document.getElementById('chatForm');
  const input      = document.getElementById('chatInput');

  if (!fab || !panel) return;

  const history = [];
  let   busy    = false;

  /* ── Open / close ── */
  const open  = () => { panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); setTimeout(() => input?.focus(), 260); };
  const close = () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); };

  fab.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });

  /* ── Suggested starters ── */
  suggestEl?.addEventListener('click', e => {
    const btn = e.target.closest('.suggest');
    if (!btn) return;
    send(btn.dataset.q || btn.textContent.trim());
    suggestEl.remove();
  });

  /* ── Submit ── */
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    send(text);
    input.value = '';
    suggestEl?.remove();
  });

  /* ── UI helpers ── */
  function addMsg(role, text, cls) {
    const d = document.createElement('div');
    d.className = `chat-msg ${cls || role}`;
    d.textContent = text;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
    return d;
  }
  function addTyping() {
    const t = document.createElement('div');
    t.id = 'chatTyping'; t.className = 'chat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(t);
    messages.scrollTop = messages.scrollHeight;
  }
  function removeTyping() { document.getElementById('chatTyping')?.remove(); }

  /* ── Core send ── */
  async function send(message) {
    if (busy) return;
    busy = true;
    addMsg('user', message);
    history.push({ role: 'user', content: message });
    addTyping();

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message, history: history.slice(-12) }),
      });
      removeTyping();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data  = await res.json();
      const reply = data?.reply || 'Sorry — no response.';
      addMsg('ai', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeTyping();
      addMsg('ai', 'Assistant unavailable right now. Email marnen88@rowan.edu directly.', 'error');
      console.error('[chatbot]', err);
    } finally {
      busy = false;
    }
  }
})();
