/* ===========================================================
   animations.js — GSAP + ScrollTrigger + Typed.js
   =========================================================== */

(() => {
  'use strict';

  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = () => {
    /* ---------- Typed.js — hero subtitle cycling ---------- */
    if (window.Typed && document.getElementById('typed')) {
      new Typed('#typed', {
        strings: [
          'Network Security Engineer',
          'Ethical Hacker',
          'SOC Analyst',
          'Penetration Tester',
          'Network Administrator',
        ],
        typeSpeed: 55,
        backSpeed: 30,
        backDelay: 1600,
        startDelay: 400,
        loop: true,
        smartBackspace: true,
        cursorChar: '_',
      });
    }

    if (prefersReduced) return; // skip GSAP scroll work for reduced-motion users

    if (!window.gsap) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    /* ---------- Hero entrance ---------- */
    gsap.from('.hero-label', { y: 12, opacity: 0, duration: 0.7, delay: 0.2, ease: 'power3.out' });
    gsap.from('.hero-title', { y: 24, opacity: 0, duration: 0.9, delay: 0.35, ease: 'power3.out' });
    gsap.from('.hero-subtitle', { y: 18, opacity: 0, duration: 0.8, delay: 0.55, ease: 'power3.out' });
    gsap.from('.hero-bio', { y: 14, opacity: 0, duration: 0.7, delay: 0.7, ease: 'power3.out' });
    gsap.from('.hero-cta .btn', { y: 14, opacity: 0, duration: 0.6, delay: 0.85, ease: 'power3.out', stagger: 0.1 });

    /* ---------- Hero parallax on mouse ---------- */
    const heroGradient = document.querySelector('.hero-gradient');
    const heroGrid = document.querySelector('.hero-grid');
    if (heroGradient && heroGrid) {
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / innerWidth - 0.5) * 14;
        const y = (e.clientY / innerHeight - 0.5) * 14;
        gsap.to(heroGradient, { x, y, duration: 0.8, ease: 'power2.out' });
        gsap.to(heroGrid, { x: x * 0.4, y: y * 0.4, duration: 0.8, ease: 'power2.out' });
      });
    }

    if (!window.ScrollTrigger) return;

    /* ---------- Section reveal on scroll ---------- */
    document.querySelectorAll('.section').forEach((section) => {
      gsap.from(section.querySelectorAll('.section-header > *'), {
        scrollTrigger: { trigger: section, start: 'top 78%' },
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
      });
    });

    /* ---------- Project card stagger ---------- */
    gsap.from('.projects-grid .project-card', {
      scrollTrigger: { trigger: '.projects-grid', start: 'top 80%' },
      y: 28,
      opacity: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.12,
    });

    /* ---------- Skills group stagger ---------- */
    gsap.from('.skills-grid .skill-group', {
      scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' },
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
    });

    /* ---------- Timeline items reveal ---------- */
    gsap.utils.toArray('.timeline-item').forEach((item) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 85%' },
        x: item.classList.contains('left') ? -30 : 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
    });

    /* ---------- Contact reveal ---------- */
    gsap.from('.contact-info > .contact-card', {
      scrollTrigger: { trigger: '.contact-info', start: 'top 80%' },
      y: 18,
      opacity: 0,
      duration: 0.55,
      ease: 'power3.out',
      stagger: 0.08,
    });
    gsap.from('.contact-form', {
      scrollTrigger: { trigger: '.contact-form', start: 'top 80%' },
      y: 22,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    });
  };

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
