/* ============================================================
   main.js — Navbar, mobile nav, smooth scroll, stat counters,
   terminal typing, contact form, matrix easter egg.
   No GSAP. No magnetic. Pure vanilla JS.
   ============================================================ */

(() => {
  'use strict';

  /* ── Helpers ── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Navbar scroll state ── */
  const navbar = $('#navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  navbar?.classList.toggle('scrolled', window.scrollY > 60);

  /* ── Active nav link ── */
  const navLinks = $$('.nav-link');
  const sectionIds = ['home', 'about', 'experience', 'skills', 'projects', 'certifications', 'contact'];
  const pageSections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function updateActive() {
    const mid = window.scrollY + window.innerHeight * 0.45;
    let active = pageSections[0]?.id || 'home';
    for (const sec of pageSections) {
      if (sec.offsetTop <= mid) active = sec.id;
    }
    navLinks.forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === `#${active}`)
    );
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

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

  /* ── Stat counters (count-up on scroll) ── */
  const statNums = $$('.stat-num');
  if (statNums.length) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const dur    = 1400;
        const start  = performance.now();

        function tick(now) {
          const t     = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        statIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statIO.observe(el));
  }

  /* ── Terminal typewriter ── */
  const termBody = $('#terminalBody');
  if (termBody) {
    const outLines = termBody.querySelectorAll('[data-term]');
    let started = false;

    const termIO = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || started) return;
      started = true;
      termIO.disconnect();
      let delay = 400;
      outLines.forEach(line => {
        const text = line.dataset.term || '';
        setTimeout(() => typeOut(line, text, 22), delay);
        delay += text.length * 22 + 280;
      });
    }, { threshold: 0.3 });
    termIO.observe(termBody);
  }

  function typeOut(node, text, speed) {
    let i = 0;
    const tick = () => {
      node.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, speed);
    };
    tick();
  }

  /* ── Contact form ── */
  const form       = $('#contactForm');
  const formStatus = $('#formStatus');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const action = form.getAttribute('action') || '';

    if (action.includes('YOUR_FORM_ID')) {
      if (formStatus) {
        formStatus.textContent = 'Replace YOUR_FORM_ID in index.html with your Formspree form ID.';
        formStatus.className   = 'form-status error';
      }
      return;
    }

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
