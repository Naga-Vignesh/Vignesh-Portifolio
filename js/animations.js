/* ===========================================================
   animations.js — Typed.js init only
   All scroll animations are CSS + IntersectionObserver in main.js
   =========================================================== */

(() => {
  'use strict';

  const init = () => {
    if (window.Typed && document.getElementById('typed')) {
      new Typed('#typed', {
        strings: [
          'Network Security Engineer',
          'Ethical Hacker',
          'SOC Analyst',
          'Penetration Tester',
          'Network Administrator',
        ],
        typeSpeed: 50,
        backSpeed: 28,
        backDelay: 1800,
        startDelay: 500,
        loop: true,
        smartBackspace: true,
        cursorChar: '|',
      });
    }
  };

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
