/* ============================================================
   animations.js — Typed.js init.
   All scroll reveals are handled by IntersectionObserver in main.js.
   ============================================================ */

(() => {
  'use strict';

  function init() {
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
      typeSpeed:   52,
      backSpeed:   28,
      backDelay:  1800,
      startDelay:  600,
      loop:        true,
      smartBackspace: true,
      cursorChar:  '|',
    });
  }

  /* Wait for all deferred scripts (Three.js etc.) to load first */
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
