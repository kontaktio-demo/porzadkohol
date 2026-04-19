'use strict';

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function initParticleCanvas() {
    var canvas = document.createElement('canvas');
    canvas.id = 'bgParticles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    var ctx = canvas.getContext('2d');
    var w, h, particles, animId;
    var PARTICLE_COUNT = Math.min(Math.floor(window.innerWidth / 18), 70);
    var CONNECT_DIST = 140;
    var SPEED = 0.25;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
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

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
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

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
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

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        createParticles();
      }, 250);
    });
  }

  function initScrollDecorations() {
    var line = document.createElement('div');
    line.className = 'bg-scroll-line';
    line.setAttribute('aria-hidden', 'true');
    document.body.appendChild(line);

    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'bg-scroll-dots';
    dotsWrap.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 6; i++) {
      var dot = document.createElement('span');
      dotsWrap.appendChild(dot);
    }
    document.body.appendChild(dotsWrap);

    function updateScroll() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;

      line.style.transform = 'scaleY(' + progress + ')';

      var dots = dotsWrap.querySelectorAll('span');
      dots.forEach(function (dot, i) {
        var threshold = (i + 1) / (dots.length + 1);
        dot.classList.toggle('active', progress >= threshold);
      });
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
  }

  function initWaveDividers() {
    var wavePairs = [
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

    var waveSVGs = {
      wave1: '<svg class="bg-wave-svg" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,30 C240,55 480,0 720,30 C960,60 1200,5 1440,30 L1440,60 L0,60Z" fill="currentColor"/></svg>',
      wave2: '<svg class="bg-wave-svg" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,20 C360,50 720,0 1080,35 C1260,48 1380,15 1440,20 L1440,60 L0,60Z" fill="currentColor"/></svg>',
      wave3: '<svg class="bg-wave-svg" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,35 C180,10 360,50 540,25 C720,0 900,45 1080,20 C1260,0 1380,40 1440,25 L1440,60 L0,60Z" fill="currentColor"/></svg>',
    };

    wavePairs.forEach(function (cfg) {
      var source = document.querySelector(cfg.after);
      if (!source) return;

      var next = source.nextElementSibling;
      if (!next) return;

      var divider = document.createElement('div');
      divider.className = 'bg-wave-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.innerHTML = waveSVGs[cfg.type];

      var isNextAlt = next.classList.contains('bg-alt');
      var isNextFooter = next.classList.contains('footer');
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
    initWaveDividers();
    initScrollDecorations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
