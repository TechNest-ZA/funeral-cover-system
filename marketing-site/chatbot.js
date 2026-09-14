// Floating chat widget, answered by Claude on the backend (see
// backend/.../ChatService.java) so visitors get real answers about plans
// and cover even overnight when no one's at the branch. Builds its own DOM -
// no markup needed on the page beyond the <script> tag - so every page gets
// it for free and there's nothing to keep in sync across the 9 HTML files.
(function () {
  // Same-origin assumption doesn't hold here (marketing site and backend
  // are two separate deployments - Vercel and Railway respectively).
  var API_BASE = 'https://funeral-cover-system-production-400c.up.railway.app';

  var GREETING = "Hi, I'm the Sondela assistant. Ask me about plans, pricing, or how cover works " +
    "— I'm here even when the office is closed. If it's an emergency, call 013 000 0000 any time.";

  var history = []; // [{role, content}, ...] sent back to the API for context
  var open = false;
  var sending = false;

  var launcher = document.createElement('button');
  launcher.className = 'sondela-chat-launcher';
  launcher.setAttribute('aria-label', 'Chat with us');
  launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 ' +
    '8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 ' +
    '8.48 0 0 1 8 8v.5z"/></svg>';

  var panel = document.createElement('div');
  panel.className = 'sondela-chat-panel';
  panel.hidden = true;
  panel.innerHTML =
    '<div class="sondela-chat-header">' +
      '<div><div class="sondela-chat-header-title">Sondela</div>' +
      '<div class="sondela-chat-header-sub">USUALLY REPLIES INSTANTLY</div></div>' +
      '<button class="sondela-chat-close" aria-label="Close chat">×</button>' +
    '</div>' +
    '<div class="sondela-chat-messages"></div>' +
    '<form class="sondela-chat-form">' +
      '<input class="sondela-chat-input" type="text" placeholder="Ask about plans, pricing..." ' +
      'maxlength="1000" autocomplete="off" />' +
      '<button class="sondela-chat-send" type="submit">Send</button>' +
    '</form>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector('.sondela-chat-messages');
  var formEl = panel.querySelector('.sondela-chat-form');
  var inputEl = panel.querySelector('.sondela-chat-input');
  var sendBtn = panel.querySelector('.sondela-chat-send');
  var closeBtn = panel.querySelector('.sondela-chat-close');

  function addBubble(role, text) {
    var bubble = document.createElement('div');
    bubble.className = 'sondela-chat-bubble ' + role;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function togglePanel(show) {
    open = show;
    panel.hidden = !show;
    if (show) {
      if (messagesEl.children.length === 0) addBubble('assistant', GREETING);
      inputEl.focus();
    }
  }

  launcher.addEventListener('click', function () { togglePanel(!open); });
  closeBtn.addEventListener('click', function () { togglePanel(false); });

  // Native form submission already handles Enter in every real browser, but
  // some automation/virtual-keyboard input paths dispatch a key event that
  // never reaches the browser's default form-submit behaviour. Handling
  // Enter explicitly here means it works either way, with no double-submit
  // risk since requestSubmit() re-fires the same 'submit' listener below.
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text || sending) return;

    addBubble('user', text);
    inputEl.value = '';
    sending = true;
    sendBtn.disabled = true;
    var typing = addBubble('assistant typing', 'Typing...');

    fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('chat request failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        typing.remove();
        addBubble('assistant', data.reply);
        history.push({ role: 'user', content: text });
        history.push({ role: 'assistant', content: data.reply });
        if (history.length > 16) history = history.slice(history.length - 16);
      })
      .catch(function () {
        typing.remove();
        addBubble('assistant', "Sorry, I couldn't send that. Please call or WhatsApp us on 013 000 0000.");
      })
      .finally(function () {
        sending = false;
        sendBtn.disabled = false;
      });
  });
})();
