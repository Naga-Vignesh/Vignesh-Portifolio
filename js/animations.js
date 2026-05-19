/* ============================================================
   animations.js — Typed.js init, stat counters, terminal typewriter.
   ============================================================ */

/* ── Typed.js hero subtitle ── */
(function initTyped() {
  function run() {
    if (!window.Typed || !document.getElementById('typed')) return;
    new Typed('#typed', {
      strings: [
        'Network Security Engineer',
        'NOC Operations Specialist',
        'Infrastructure Engineer',
        'Ethical Hacker',
        'Penetration Tester',
        'SOC Analyst',
      ],
      typeSpeed:      52,
      backSpeed:      28,
      backDelay:    1800,
      startDelay:    600,
      loop:          true,
      smartBackspace: true,
      cursorChar:    '|',
    });
  }
  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }
})();


/* ── Stat counters ── */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (counters.length === 0) return;

  const animateCounter = (el) => {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const target     = parseInt(el.dataset.target, 10);
    const suffix     = el.dataset.suffix || '';
    const duration   = 1800;
    const frameRate  = 16;
    const totalFrames = duration / frameRate;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);
      el.textContent = current + suffix;
      if (frame >= totalFrames) {
        el.textContent = target + suffix;
        clearInterval(timer);
      }
    }, frameRate);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

  counters.forEach(c => observer.observe(c));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCounters);
} else {
  initCounters();
}
/* Fallback: re-run after 500 ms in case elements aren't ready yet */
setTimeout(initCounters, 500);


/* ── Terminal typewriter ── */
function initTerminal() {
  const terminal = document.querySelector('.terminal-body');
  if (!terminal) return;

  /* Prevent double-init */
  if (terminal.dataset.termStarted) return;
  terminal.dataset.termStarted = 'true';

  terminal.innerHTML = '';

  const sequence = [
    { type: 'command', text: 'whoami' },
    { type: 'output',  text: 'naga_vignesh_marneni' },
    { type: 'command', text: 'cat role.txt' },
    { type: 'output',  text: 'NW Deployment Technician IV @ DCC Communities' },
    { type: 'command', text: 'cat certs.txt' },
    { type: 'output',  text: 'CCNA | Network+ | Security+ | SC-900 | AZ-900' },
    { type: 'command', text: 'cat status.txt' },
    { type: 'output',  text: '[■ AVAILABLE FOR OPPORTUNITIES]', green: true },
  ];

  let lineIndex = 0;
  let charIndex  = 0;
  let currentEl  = null;

  function createLine(type) {
    const line = document.createElement('div');
    line.className = 'terminal-line';

    if (type === 'command') {
      const prompt = document.createElement('span');
      prompt.className = 'terminal-prompt';
      prompt.textContent = '$ ';
      line.appendChild(prompt);
    }

    const text = document.createElement('span');
    const item = sequence[lineIndex];
    text.className = type === 'output'
      ? (item.green ? 'terminal-output terminal-green' : 'terminal-output')
      : 'terminal-command';
    line.appendChild(text);
    terminal.appendChild(line);
    return text;
  }

  function typeLine() {
    if (lineIndex >= sequence.length) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      cursor.textContent = '█';
      terminal.appendChild(cursor);
      return;
    }

    const item = sequence[lineIndex];

    if (charIndex === 0) {
      currentEl = createLine(item.type);
      if (item.type === 'output') {
        /* Brief pause before output text appears */
        charIndex = -1;
        setTimeout(typeLine, 200);
        return;
      }
    }

    if (charIndex === -1) charIndex = 0;

    if (charIndex < item.text.length) {
      currentEl.textContent += item.text[charIndex];
      charIndex++;
      const delay = item.type === 'command' ? 55 : 25;
      setTimeout(typeLine, delay);
    } else {
      charIndex = 0;
      lineIndex++;
      setTimeout(typeLine, item.type === 'command' ? 350 : 180);
    }

    terminal.scrollTop = terminal.scrollHeight;
  }

  setTimeout(typeLine, 800);
}

/* Trigger terminal when About section enters viewport */
(function setupTerminalTrigger() {
  const about = document.querySelector('#about');
  if (!about) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initTerminal();
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  obs.observe(about);
})();
