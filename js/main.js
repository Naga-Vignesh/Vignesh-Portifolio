/* ===========================================================
   main.js — navbar, mobile drawer, scroll reveals,
   stat counters, terminal typing, contact form
   No GSAP. No magnetic. No tilt. Just clean vanilla JS.
   =========================================================== */

(() => {
  'use strict';

  /* ---------- Navbar scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionIds = ['home', 'about', 'skills', 'projects', 'certifications', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function updateActive() {
    const mid = window.scrollY + window.innerHeight / 2;
    let active = sections[0]?.id || 'home';
    for (const s of sections) {
      if (s.offsetTop <= mid) active = s.id;
    }
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${active}`);
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
      closeDrawer();
    });
  });

  /* ---------- Mobile drawer ---------- */
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  function closeDrawer() {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
  navToggle?.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    backdrop.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  backdrop?.addEventListener('click', closeDrawer);

  /* ---------- Scroll Reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------- Stat counters ---------- */
  const statEls = document.querySelectorAll('.stat-number');
  if (statEls.length) {
    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        statObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    statEls.forEach(s => statObs.observe(s));
  }

  /* ---------- Terminal typing ---------- */
  const terminal = document.getElementById('terminalBody');
  if (terminal) {
    const lines = terminal.querySelectorAll('[data-term]');
    const termObs = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      termObs.disconnect();
      let delay = 300;
      lines.forEach(line => {
        const text = line.dataset.term || '';
        setTimeout(() => typeOut(line, text, 20), delay);
        delay += text.length * 20 + 250;
      });
    }, { threshold: 0.3 });
    termObs.observe(terminal);
  }

  function typeOut(node, text, speed) {
    let i = 0;
    const tick = () => {
      node.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, speed);
    };
    tick();
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = form.getAttribute('action') || '';
    formStatus.textContent = 'Sending…';
    formStatus.className = 'form-status';

    if (action.includes('your_form_id')) {
      formStatus.textContent = 'Form not configured. Replace your_form_id in index.html with a Formspree ID.';
      formStatus.classList.add('error');
      return;
    }

    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (res.ok) {
        formStatus.textContent = 'Message sent — talk soon.';
        formStatus.classList.add('success');
        form.reset();
      } else {
        throw new Error('Failed');
      }
    } catch {
      formStatus.textContent = 'Could not send. Please email directly.';
      formStatus.classList.add('error');
    }
  });
})();
