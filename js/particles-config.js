/* ===========================================================
   particles-config.js — tsParticles network mesh on hero
   Skipped on touch devices and reduced-motion users for perf
   =========================================================== */

(() => {
  'use strict';

  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const init = () => {
    if (prefersReduced || isMobile || !window.tsParticles) return;

    tsParticles.load('tsparticles', {
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 60, density: { enable: true, area: 900 } },
        color: { value: ['#00d4ff', '#7b2fff', '#ffffff'] },
        shape: { type: 'circle' },
        opacity: {
          value: 0.45,
          random: { enable: true, minimumValue: 0.15 },
        },
        size: { value: { min: 1, max: 2.4 } },
        links: {
          enable: true,
          distance: 140,
          color: '#00d4ff',
          opacity: 0.18,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.7,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'bounce' },
        },
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: { enable: true, mode: 'repulse' },
          resize: true,
        },
        modes: {
          repulse: { distance: 80, duration: 0.4 },
        },
      },
    });
  };

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
