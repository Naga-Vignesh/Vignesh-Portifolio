/* ============================================================
   hero-3d.js — Three.js r128 tunnel background
   Fixed canvas behind all page content.
   Disabled automatically on mobile (<=768px) for performance.
   ============================================================ */

(() => {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  /* Skip on mobile — CSS gradient fallback is applied instead */
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    /* Give the hero section the CSS mesh background so it isn't blank */
    canvas.style.display = 'none';
    return;
  }

  /* Bail gracefully if Three.js failed to load */
  if (!window.THREE) {
    canvas.style.display = 'none';
    return;
  }

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x050508, 1); /* --bg-primary */

  /* ── Scene ── */
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050508, 2, 70);

  /* ── Camera ── */
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 0);

  /* ── Tunnel ── */
  /* CylinderGeometry oriented along Y; we rotate 90° on X to align with Z */
  const tunnelGeo = new THREE.CylinderGeometry(3, 3, 80, 8, 30, true);
  tunnelGeo.rotateX(Math.PI / 2); /* now extends along ±Z */

  const tunnelEdges = new THREE.EdgesGeometry(tunnelGeo);
  const tunnelMat  = new THREE.LineBasicMaterial({
    color: 0x00d4ff,      /* --accent-cyan */
    transparent: true,
    opacity: 0.12,
  });
  const tunnel = new THREE.LineSegments(tunnelEdges, tunnelMat);
  tunnel.position.z = -20; /* centre of tunnel: -60 → +20 from world origin */
  scene.add(tunnel);

  /* Outer accent ring (purple, very faint) */
  const outerGeo   = new THREE.CylinderGeometry(4.2, 4.2, 60, 8, 1, true);
  outerGeo.rotateX(Math.PI / 2);
  const outerEdges = new THREE.EdgesGeometry(outerGeo);
  const outerMat   = new THREE.LineBasicMaterial({
    color: 0x7b2fff,
    transparent: true,
    opacity: 0.05,
  });
  const outerRing  = new THREE.LineSegments(outerEdges, outerMat);
  outerRing.position.z = -20;
  scene.add(outerRing);

  /* ── Dust particles ── */
  const PARTICLE_COUNT = 300;
  const particleGeo    = new THREE.BufferGeometry();
  const positions      = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    /* Scatter inside and slightly outside the tunnel radius */
    const angle = Math.random() * Math.PI * 2;
    const r     = Math.random() * 2.8;
    positions[i * 3    ] = Math.cos(angle) * r;
    positions[i * 3 + 1] = Math.sin(angle) * r;
    positions[i * 3 + 2] = Math.random() * 80 - 60; /* z: -60 → +20 */
  }

  particleGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  const particleMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ── Camera dolly state ── */
  const DOLLY_DURATION = 3.0;   /* seconds */
  const DOLLY_TARGET_Z = -8;    /* end position */
  let   startTime      = null;
  let   dollying       = true;
  let   bobTime        = 0;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ── Animation loop ── */
  let raf;
  function animate(timestamp) {
    raf = requestAnimationFrame(animate);

    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) * 0.001; /* seconds */

    /* Camera dolly (first DOLLY_DURATION seconds) */
    if (dollying) {
      const t = Math.min(1, elapsed / DOLLY_DURATION);
      camera.position.z = DOLLY_TARGET_Z * easeOutCubic(t);
      if (t >= 1) dollying = false;
    }

    /* Gentle bob after dolly completes */
    if (!dollying) {
      bobTime += 0.004;
      camera.position.y = Math.sin(bobTime) * 0.12;
      camera.position.x = Math.sin(bobTime * 0.7) * 0.06;
    }

    /* Slow tunnel rotation for cinematic feel */
    tunnel.rotation.z    += 0.0008;
    outerRing.rotation.z -= 0.0005;

    /* Drift particles forward (toward camera) */
    const pos = particleGeo.attributes.position.array;
    const camZ = camera.position.z;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 2] += 0.04;
      /* Reset when particle passes behind the camera */
      if (pos[i * 3 + 2] > camZ + 4) {
        const angle = Math.random() * Math.PI * 2;
        const r     = Math.random() * 2.8;
        pos[i * 3    ] = Math.cos(angle) * r;
        pos[i * 3 + 1] = Math.sin(angle) * r;
        pos[i * 3 + 2] = camZ - 70;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  /* ── Resize ── */
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* Pause when tab is hidden to save GPU */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(animate);
    }
  });
})();
