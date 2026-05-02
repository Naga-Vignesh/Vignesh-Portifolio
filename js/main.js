/* ===========================================================
   main.js — navbar, mobile drawer, magnetic, tilt, form,
   matrix easter egg, terminal typing
   =========================================================== */

(() => {
  'use strict';

  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch =
    matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  /* ---------- Page-load fade-out ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) requestAnimationFrame(() => loader.classList.add('hidden'));
    setTimeout(() => loader && loader.remove(), 700);
  });

  /* ---------- Navbar scroll state ---------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 80);
    updateActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active link sync via IntersectionObserver ---------- */
  const sections = ['home', 'about', 'skills', 'projects', 'certifications', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let currentId = 'home';
  const setActive = (id) => {
    if (id === currentId) return;
    currentId = id;
    navLinks.forEach((l) => {
      l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.4) {
          setActive(e.target.id);
        }
      });
    },
    { threshold: [0.4, 0.6] }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  function updateActiveLink() {
    // Fallback for short pages — fired on scroll
    let bestId = sections[0]?.id;
    let bestDelta = Infinity;
    const mid = window.scrollY + window.innerHeight / 2;
    sections.forEach((s) => {
      const top = s.offsetTop;
      const d = Math.abs(top - mid + s.offsetHeight / 2);
      if (d < bestDelta) {
        bestDelta = d;
        bestId = s.id;
      }
    });
    if (bestId) setActive(bestId);
  }

  /* ---------- Smooth scroll with offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href');
      if (!target || target === '#') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
      // Close mobile drawer if open
      drawer?.classList.remove('open');
      backdrop?.classList.remove('open');
      navToggle?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Mobile drawer ---------- */
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  navToggle?.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    backdrop.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
  });
  backdrop?.addEventListener('click', () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });

  /* ---------- Magnetic effect ---------- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = el.classList.contains('btn') ? 0.32 : 0.22;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- 3D tilt for project cards ---------- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.tilt').forEach((card) => {
      const damp = 14;
      let raf = 0;
      let tx = 0, ty = 0;

      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * damp;
        ty = px * damp;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const apply = () => {
        card.style.transform = `perspective(900px) rotateX(${tx}deg) rotateY(${ty}deg) translateY(-4px)`;
        raf = 0;
      };
      const reset = () => {
        cancelAnimationFrame(raf); raf = 0;
        card.style.transform = '';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
    });
  }

  /* ---------- Stat counters ---------- */
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const dur = 1200;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      statObs.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-number').forEach((s) => statObs.observe(s));

  /* ---------- Terminal typing reveal ---------- */
  const terminal = document.getElementById('terminalBody');
  if (terminal) {
    const lines = terminal.querySelectorAll('[data-term]');
    const termObs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        termObs.disconnect();
        let delay = 200;
        lines.forEach((line) => {
          const text = line.dataset.term || '';
          setTimeout(() => typeOut(line, text, 18), delay);
          delay += text.length * 18 + 220;
        });
      },
      { threshold: 0.3 }
    );
    termObs.observe(terminal);
  }
  function typeOut(node, text, speed) {
    let i = 0;
    const tick = () => {
      node.innerHTML = text.slice(0, i++);
      if (i <= text.length) setTimeout(tick, speed);
    };
    tick();
  }

  /* ---------- Skill ring animation ---------- */
  const ringObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const ring = entry.target;
        const p = parseInt(ring.dataset.ring, 10) || 0;
        ring.style.setProperty('--p', p);
        ringObs.unobserve(ring);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.ring').forEach((r) => ringObs.observe(r));

  /* ---------- Section header in-view ---------- */
  const headerObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          headerObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('.section-header').forEach((h) => headerObs.observe(h));

  /* ---------- Timeline draw on scroll ---------- */
  const timeline = document.getElementById('timeline');
  if (timeline) {
    const tlObs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          timeline.classList.add('in-view');
          tlObs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    tlObs.observe(timeline);
  }

  /* ---------- Contact form (Formspree or fallback) ---------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = form.getAttribute('action') || '';
    const data = new FormData(form);

    formStatus.textContent = 'Encrypting and sending…';
    formStatus.className = 'form-status';

    if (action.includes('your_form_id')) {
      // Formspree placeholder — graceful fallback
      formStatus.textContent =
        'Form endpoint not configured. Replace your_form_id in index.html with a real Formspree ID, or email marnen88@rowan.edu directly.';
      formStatus.classList.add('error');
      return;
    }

    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (res.ok) {
        formStatus.textContent = 'Message sent — talk soon.';
        formStatus.classList.add('success');
        form.reset();
      } else {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Something went wrong.');
      }
    } catch (err) {
      formStatus.textContent =
        'Could not send: ' + (err.message || 'unknown error');
      formStatus.classList.add('error');
    }
  });

  /* ===========================================================
     Matrix-rain easter egg — type "hack"
     =========================================================== */
  const canvas = document.getElementById('matrixCanvas');
  let matrixActive = false;
  let matrixCleanup = null;
  let typedKeys = '';

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    typedKeys = (typedKeys + e.key.toLowerCase()).slice(-4);
    if (typedKeys === 'hack') toggleMatrix();
    if (e.key === 'Escape' && matrixActive) toggleMatrix();
  });

  function toggleMatrix() {
    if (matrixActive) {
      matrixActive = false;
      canvas.classList.remove('active');
      if (matrixCleanup) { matrixCleanup(); matrixCleanup = null; }
      return;
    }
    matrixActive = true;
    canvas.classList.add('active');
    matrixCleanup = startMatrix(canvas);
  }

  function startMatrix(cv) {
    const ctx = cv.getContext('2d');
    let w, h, cols, drops;
    const fontSize = 16;
    const chars = '01アァカサタナハマヤラワン<>$#%&'.split('');

    const resize = () => {
      w = cv.width = innerWidth * devicePixelRatio;
      h = cv.height = innerHeight * devicePixelRatio;
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      cols = Math.floor(w / (fontSize * devicePixelRatio));
      drops = new Array(cols).fill(1);
    };
    resize();
    addEventListener('resize', resize);

    let raf = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(10,10,15,0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00d4ff';
      ctx.font = `${fontSize * devicePixelRatio}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        const x = i * fontSize * devicePixelRatio;
        const y = drops[i] * fontSize * devicePixelRatio;
        ctx.fillText(ch, x, y);
        drops[i] = y > h && Math.random() > 0.975 ? 0 : drops[i] + 1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      ctx.clearRect(0, 0, w, h);
    };
  }

  /* ---------- AOS init ---------- */
  window.addEventListener('load', () => {
    if (window.AOS) {
      AOS.init({
        duration: 700,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
        disable: () => prefersReduced,
      });
    }
  });
})();
