/* ============================================================
   main.js — Navbar, mobile nav, smooth scroll, scrollspy,
   contact form, matrix easter egg.
   Counters + terminal typewriter live in animations.js.
   ============================================================ */

(() => {
  'use strict';

  /* ── Helpers ── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Dynamic copyright year ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Navbar scroll state ── */
  const navbar = $('#navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  navbar?.classList.toggle('scrolled', window.scrollY > 60);

  /* ── Active nav link (IntersectionObserver scrollspy) ── */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -40% 0px',
    });

    sections.forEach(s => spy.observe(s));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollSpy);
  } else {
    initScrollSpy();
  }

  /* ── Smooth scroll ── */
  function closeMobileNav() {
    const nav = $('#mobileNav');
    const btn = $('#navHamburger');
    nav?.classList.remove('open');
    nav?.setAttribute('aria-hidden', 'true');
    btn?.classList.remove('open');
    btn?.setAttribute('aria-expanded', 'false');
  }

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = a.getAttribute('href');
      if (!target || target === '#') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
      closeMobileNav();
    });
  });

  /* ── Mobile nav ── */
  const hamburger = $('#navHamburger');
  const mobileNav = $('#mobileNav');
  const closeBtn  = $('#mobileNavClose');

  hamburger?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    mobileNav.setAttribute('aria-hidden', String(!open));
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });
  closeBtn?.addEventListener('click', closeMobileNav);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealEls = $$('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ── Contact form ── */
  const form       = $('#contactForm');
  const formStatus = $('#formStatus');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const action = form.getAttribute('action') || '';

    if (formStatus) {
      formStatus.textContent = 'Sending…';
      formStatus.className   = 'form-status';
    }

    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (res.ok) {
        if (formStatus) {
          formStatus.textContent = 'Message sent — I'll be in touch soon.';
          formStatus.className   = 'form-status success';
        }
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      if (formStatus) {
        formStatus.textContent = 'Could not send. Email me directly at marnen88@rowan.edu';
        formStatus.className   = 'form-status error';
      }
    }
  });

  /* ── Matrix rain easter egg (type "hack") ── */
  const matCanvas = $('#matrixCanvas');
  let   matActive = false;
  let   matClean  = null;
  let   keyBuf    = '';

  window.addEventListener('keydown', e => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    keyBuf = (keyBuf + e.key.toLowerCase()).slice(-4);
    if (keyBuf === 'hack') toggleMatrix();
    if (e.key === 'Escape' && matActive) toggleMatrix();
  });

  function toggleMatrix() {
    if (matActive) {
      matActive = false;
      matCanvas?.classList.remove('active');
      matClean?.(); matClean = null;
    } else {
      matActive = true;
      matCanvas?.classList.add('active');
      matClean = startMatrix(matCanvas);
    }
  }

  function startMatrix(cv) {
    if (!cv) return () => {};
    const ctx  = cv.getContext('2d');
    const size = 14;
    const chars = '01アイウエオカキクケコサシスセソNAGAVIGNESH#$%&<>'.split('');
    let w, h, cols, drops;
    let raf = 0;

    function resize() {
      w  = cv.width  = innerWidth;
      h  = cv.height = innerHeight;
      cols  = Math.floor(w / size);
      drops = new Array(cols).fill(1);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.fillStyle = 'rgba(5,5,8,0.06)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00d4ff';
      ctx.font = `${size}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.fillText(ch, i * size, drops[i] * size);
        drops[i] = drops[i] * size > h && Math.random() > 0.975 ? 0 : drops[i] + 1;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, w, h);
    };
  }
})();
