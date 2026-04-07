'use strict';

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

          function initParticleCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bgParticles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let w, h, particles, animId;
    const PARTICLE_COUNT = Math.min(Math.floor(window.innerWidth / 18), 70);
    const CONNECT_DIST = 140;
    const SPEED = 0.25;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = document.documentElement.scrollHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED,
          r: Math.random() * 2 + 1,
          opacity: Math.random() * 0.25 + 0.08,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(26,26,26,' + p.opacity + ')';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(26,26,26,' + (0.04 * (1 - dist / CONNECT_DIST)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        createParticles();
      }, 250);
    });

        const ro = new ResizeObserver(function () {
      const newH = document.documentElement.scrollHeight;
      if (Math.abs(newH - h) > 50) {
        h = canvas.height = newH;
      }
    });
    ro.observe(document.body);
  }

          function initFloatingShapes() {
    const shapes = [
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".08"><path d="M3 22V8L12 2l9 6v14"/><rect x="9" y="14" width="6" height="8"/></svg>',
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".07"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".06"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".07"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><rect x="9" y="18" width="6" height="4"/></svg>',
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".06"><rect x="12" y="1" width="15.56" height="15.56" rx="1" transform="rotate(45 12 1)"/></svg>',
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".05"><circle cx="12" cy="12" r="10"/></svg>',
    ];

    const sections = document.querySelectorAll('.section');
    sections.forEach(function (section) {
      const count = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < count; i++) {
        const shape = document.createElement('div');
        shape.className = 'bg-float-shape';
        shape.setAttribute('aria-hidden', 'true');
        shape.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

        const x = Math.random() * 90 + 5;
        const y = Math.random() * 80 + 10;
        const duration = Math.random() * 20 + 25;
        const delay = Math.random() * -30;
        const drift = Math.random() * 50 + 30;

        shape.style.cssText =
          'left:' + x + '%;top:' + y + '%;' +
          '--float-dur:' + duration + 's;' +
          '--float-delay:' + delay + 's;' +
          '--float-drift:' + drift + 'px;';

        section.appendChild(shape);
      }
    });
  }

        function initGradientOrbs() {
    const orbConfigs = [
      { parent: '.about',         x: '75%', y: '20%', size: 340, delay: 0 },
      { parent: '.distinguishes', x: '15%', y: '60%', size: 280, delay: -8 },
      { parent: '.services',      x: '80%', y: '70%', size: 320, delay: -4 },
      { parent: '.developer',     x: '25%', y: '30%', size: 300, delay: -12 },
      { parent: '.testimonials',  x: '70%', y: '40%', size: 260, delay: -6 },
      { parent: '.contact',       x: '20%', y: '70%', size: 350, delay: -10 },
      { parent: '.partners',      x: '60%', y: '50%', size: 240, delay: -15 },
      { parent: '.agent-section', x: '85%', y: '25%', size: 280, delay: -3 },
    ];

    orbConfigs.forEach(function (cfg) {
      const parent = document.querySelector(cfg.parent);
      if (!parent) return;

      const orb = document.createElement('div');
      orb.className = 'bg-gradient-orb';
      orb.setAttribute('aria-hidden', 'true');
      orb.style.cssText =
        'left:' + cfg.x + ';top:' + cfg.y + ';' +
        'width:' + cfg.size + 'px;height:' + cfg.size + 'px;' +
        '--orb-delay:' + cfg.delay + 's;';

      parent.appendChild(orb);
    });
  }

        function initMouseParallax() {
    let mouseX = 0, mouseY = 0, ticking = false;

    const orbs = document.querySelectorAll('.bg-gradient-orb');
    const shapes = document.querySelectorAll('.bg-float-shape');

    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          orbs.forEach(function (orb, i) {
            const factor = (i % 3 + 1) * 4;
            orb.style.transform =
              'translate(' +
              (mouseX * factor) + 'px,' +
              (mouseY * factor) + 'px) translate(-50%,-50%)';
          });

          shapes.forEach(function (shape, i) {
            const factor = (i % 4 + 1) * 2;
            shape.style.setProperty('--mouse-x', (mouseX * factor) + 'px');
            shape.style.setProperty('--mouse-y', (mouseY * factor) + 'px');
          });

          ticking = false;
        });
      }
    });
  }

        function initScrollDecorations() {
        const line = document.createElement('div');
    line.className = 'bg-scroll-line';
    line.setAttribute('aria-hidden', 'true');
    document.body.appendChild(line);

        const dotsWrap = document.createElement('div');
    dotsWrap.className = 'bg-scroll-dots';
    dotsWrap.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('span');
      dotsWrap.appendChild(dot);
    }
    document.body.appendChild(dotsWrap);

    function updateScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      line.style.transform = 'scaleY(' + progress + ')';

      const dots = dotsWrap.querySelectorAll('span');
      dots.forEach(function (dot, i) {
        const threshold = (i + 1) / (dots.length + 1);
        dot.classList.toggle('active', progress >= threshold);
      });
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
  }

        function initGridPatterns() {
    const altSections = document.querySelectorAll('.section.bg-alt');
    altSections.forEach(function (section) {
      const grid = document.createElement('div');
      grid.className = 'bg-grid-pattern';
      grid.setAttribute('aria-hidden', 'true');
      section.appendChild(grid);
    });
  }

        function initWaveDividers() {
    const wavePairs = [
      { after: '.hero',           type: 'wave1' },
      { after: '.stats',          type: 'wave2' },
      { after: '.about',          type: 'wave3' },
      { after: '.distinguishes',  type: 'wave1' },
      { after: '.services',       type: 'wave2' },
      { after: '.developer',      type: 'wave3' },
      { after: '.agent-section',  type: 'wave1' },
      { after: '.testimonials',   type: 'wave2' },
      { after: '.partners',       type: 'wave3' },
    ];

    const waveSVGs = {
      wave1: '<svg class="bg-wave-svg" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,30 C240,55 480,0 720,30 C960,60 1200,5 1440,30 L1440,60 L0,60Z" fill="currentColor"/></svg>',
      wave2: '<svg class="bg-wave-svg" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,20 C360,50 720,0 1080,35 C1260,48 1380,15 1440,20 L1440,60 L0,60Z" fill="currentColor"/></svg>',
      wave3: '<svg class="bg-wave-svg" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,35 C180,10 360,50 540,25 C720,0 900,45 1080,20 C1260,0 1380,40 1440,25 L1440,60 L0,60Z" fill="currentColor"/></svg>',
    };

    wavePairs.forEach(function (cfg) {
      const source = document.querySelector(cfg.after);
      if (!source) return;

      const next = source.nextElementSibling;
      if (!next) return;

      const divider = document.createElement('div');
      divider.className = 'bg-wave-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.innerHTML = waveSVGs[cfg.type];

            const isNextAlt = next.classList.contains('bg-alt') || next.classList.contains('stats');
      const isNextFooter = next.classList.contains('footer');
      if (isNextFooter) {
        divider.style.color = '#1a1a1a';
      } else if (isNextAlt) {
        divider.style.color = '#f4f4f4';
      } else {
        divider.style.color = '#ffffff';
      }

      source.style.position = 'relative';
      source.appendChild(divider);
    });
  }

        function boot() {
    initParticleCanvas();
    initFloatingShapes();
    initGradientOrbs();
    initGridPatterns();
    initWaveDividers();
    initScrollDecorations();

        if (window.matchMedia('(hover: hover)').matches) {
      initMouseParallax();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
