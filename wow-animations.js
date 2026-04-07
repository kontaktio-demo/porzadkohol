'use strict';

(function () {

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var TILT_MAX_DEG = 5;
  var MAGNETIC_STRENGTH = 0.15;
  var HERO_PARALLAX_FACTOR = 0.4;
  var SECTION_BG_FACTOR = 0.15;
  var HEADING_PARALLAX_FACTOR = 0.06;
  var IMAGE_PARALLAX_FACTOR = 0.08;
  var CARD_PARALLAX_FACTOR = 0.04;
  var STAT_PARALLAX_FACTOR = 0.05;
  var FLOAT_SHAPE_PARALLAX = 0.12;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function getViewportProgress(el) {
    var rect = el.getBoundingClientRect();
    var center = rect.top + rect.height / 2;
    var vpCenter = window.innerHeight / 2;
    return clamp((center - vpCenter) / (window.innerHeight / 2), -1.5, 1.5);
  }

  function initEnhancedReveal() {
    var selectors = [
      '.reveal-left', '.reveal-right', '.reveal-scale',
      '.reveal-flip', '.reveal-blur', '.reveal-rotate', '.reveal-zoom',
      '.section-header', '.listing-card'
    ];
    var elements = document.querySelectorAll(selectors.join(','));
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  function initTiltCards() {
    if (!isDesktop) return;

    var cards = document.querySelectorAll(
      '.dist-card, .testimonial-card, .partner-card, .listing-card'
    );

    cards.forEach(function (card) {
      card.classList.add('tilt-3d');

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var midX = rect.width / 2;
        var midY = rect.height / 2;
        var rotateY = ((x - midX) / midX) * TILT_MAX_DEG;
        var rotateX = ((midY - y) / midY) * TILT_MAX_DEG;

        card.style.transform =
          'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px) scale(1.01)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  function initMagneticButtons() {
    if (!isDesktop) return;

    var buttons = document.querySelectorAll('.btn-primary, .btn-outline');

    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform =
          'translate(' + (x * MAGNETIC_STRENGTH) + 'px,' + (y * MAGNETIC_STRENGTH) + 'px) translateY(-3px) scale(1.02)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var heroContent = hero.querySelector('.hero-content');
    var heroScroll = hero.querySelector('.hero-scroll');
    var skyline = hero.querySelector('.skyline-wrap');

    function update() {
      var scrollY = window.scrollY;
      var heroH = hero.offsetHeight;

      if (scrollY > heroH * 1.5) return;

      hero.style.backgroundPositionY = (scrollY * HERO_PARALLAX_FACTOR) + 'px';

      if (heroContent) {
        heroContent.style.transform =
          'translateY(' + (scrollY * -0.15) + 'px)';
        heroContent.style.opacity =
          clamp(1 - scrollY / (heroH * 0.7), 0, 1);
      }

      if (heroScroll) {
        heroScroll.style.opacity =
          clamp(1 - scrollY / 200, 0, 1);
      }

      if (skyline) {
        skyline.style.transform =
          'translateY(' + (scrollY * 0.1) + 'px)';
      }
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initSectionBgParallax() {
    var sections = document.querySelectorAll(
      '.about, .distinguishes, .services, .developer, .agent-section, .testimonials, .contact, .partners, .footer'
    );
    if (!sections.length) return;

    sections.forEach(function (s) {
      s.classList.add('parallax-section');
    });

    function update() {
      sections.forEach(function (section) {
        var progress = getViewportProgress(section);
        var shift = progress * SECTION_BG_FACTOR * 100;
        section.style.setProperty('--parallax-y', shift + 'px');
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initDataParallax() {
    var elements = document.querySelectorAll(
      '[data-parallax-speed], [data-parallax-x], [data-parallax-scale], [data-parallax-rotate], [data-parallax-fade]'
    );
    if (!elements.length) return;

    function update() {
      elements.forEach(function (el) {
        var progress = getViewportProgress(el);
        var transforms = [];
        var extraStyles = {};

        var speed = parseFloat(el.dataset.parallaxSpeed);
        if (!isNaN(speed)) {
          transforms.push('translateY(' + (progress * speed * 100) + 'px)');
        }

        var xSpeed = parseFloat(el.dataset.parallaxX);
        if (!isNaN(xSpeed)) {
          transforms.push('translateX(' + (progress * xSpeed * 100) + 'px)');
        }

        var scaleRange = parseFloat(el.dataset.parallaxScale);
        if (!isNaN(scaleRange)) {
          var scale = 1 + progress * scaleRange;
          transforms.push('scale(' + clamp(scale, 0.5, 1.5) + ')');
        }

        var rotateDeg = parseFloat(el.dataset.parallaxRotate);
        if (!isNaN(rotateDeg)) {
          transforms.push('rotate(' + (progress * rotateDeg) + 'deg)');
        }

        var fadeDir = el.dataset.parallaxFade;
        if (fadeDir !== undefined) {
          var opacity = fadeDir === 'in'
            ? clamp(1 - Math.abs(progress), 0, 1)
            : clamp(Math.abs(progress), 0, 1);
          el.style.opacity = opacity;
        }

        if (transforms.length) {
          el.style.transform = transforms.join(' ');
        }
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initImageParallax() {
    if (isTouchDevice) return;

    var images = document.querySelectorAll(
      '.about-img-main, .about-img-secondary, .service-img, .dev-img, .off-market-img, .agent-photo'
    );
    if (!images.length) return;

    function update() {
      images.forEach(function (img) {
        var rect = img.getBoundingClientRect();

        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

        var progress = getViewportProgress(img);
        var shift = progress * IMAGE_PARALLAX_FACTOR * 100;

        img.style.backgroundPositionY = 'calc(50% + ' + shift + 'px)';
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initHeadingParallax() {
    if (isTouchDevice) return;

    var headings = document.querySelectorAll(
      '.section-header h2, #about-heading, #agent-heading'
    );
    if (!headings.length) return;

    function update() {
      headings.forEach(function (h) {
        var rect = h.getBoundingClientRect();
        if (rect.bottom < -50 || rect.top > window.innerHeight + 50) return;

        var progress = getViewportProgress(h);
        var shift = progress * HEADING_PARALLAX_FACTOR * 100;
        h.style.transform = 'translateY(' + shift + 'px)';
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initCardParallax() {
    if (isTouchDevice) return;

    var grids = document.querySelectorAll(
      '.dist-grid, .services-grid, .testimonials-grid, .partners-grid'
    );
    if (!grids.length) return;

    function update() {
      grids.forEach(function (grid) {
        var gridRect = grid.getBoundingClientRect();
        if (gridRect.bottom < -100 || gridRect.top > window.innerHeight + 100) return;

        var cards = grid.children;
        for (var i = 0; i < cards.length; i++) {
          var progress = getViewportProgress(cards[i]);

          var direction = (i % 2 === 0) ? 1 : -1;
          var shift = progress * CARD_PARALLAX_FACTOR * direction * 60;
          cards[i].style.setProperty('--card-parallax-y', shift + 'px');
        }
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initStatParallax() {
    if (isTouchDevice) return;

    var stats = document.querySelectorAll('.stat');
    if (!stats.length) return;

    function update() {
      stats.forEach(function (stat, i) {
        var progress = getViewportProgress(stat);
        var shift = progress * STAT_PARALLAX_FACTOR * (i + 1) * 40;
        stat.style.setProperty('--stat-parallax-y', shift + 'px');
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initFloatShapeParallax() {
    if (isTouchDevice) return;

    var shapes = document.querySelectorAll('.bg-float-shape');
    if (!shapes.length) return;

    function update() {
      shapes.forEach(function (shape, i) {
        var rect = shape.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

        var progress = getViewportProgress(shape);
        var factor = ((i % 5) + 1) * FLOAT_SHAPE_PARALLAX;
        var shift = progress * factor * 80;

        shape.style.setProperty('--scroll-y', shift + 'px');
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initDecorativeParallax() {
    if (isTouchDevice) return;

    var decorations = [
      { parent: '.about',         shapes: [
        { type: 'circle', x: '85%', y: '15%', size: 80, speed: 0.2, opacity: 0.04 },
        { type: 'square',  x: '5%',  y: '80%', size: 40, speed: -0.15, opacity: 0.03, rotate: 45 },
      ]},
      { parent: '.distinguishes', shapes: [
        { type: 'circle', x: '10%', y: '25%', size: 120, speed: 0.18, opacity: 0.035 },
        { type: 'line',   x: '90%', y: '60%', size: 100, speed: -0.1, opacity: 0.04 },
      ]},
      { parent: '.services',      shapes: [
        { type: 'ring',   x: '92%', y: '20%', size: 60, speed: 0.25, opacity: 0.04 },
        { type: 'dots',   x: '3%',  y: '70%', size: 80, speed: -0.12, opacity: 0.03 },
      ]},
      { parent: '.developer',     shapes: [
        { type: 'circle', x: '88%', y: '75%', size: 100, speed: 0.15, opacity: 0.03 },
        { type: 'square',  x: '8%', y: '30%', size: 50, speed: -0.2, opacity: 0.04, rotate: 30 },
      ]},
      { parent: '.agent-section', shapes: [
        { type: 'ring',   x: '5%',  y: '80%', size: 70, speed: 0.22, opacity: 0.04 },
      ]},
      { parent: '.testimonials',  shapes: [
        { type: 'circle', x: '95%', y: '30%', size: 90, speed: -0.18, opacity: 0.035 },
        { type: 'dots',   x: '5%',  y: '50%', size: 60, speed: 0.1, opacity: 0.025 },
      ]},
      { parent: '.contact',       shapes: [
        { type: 'square',  x: '90%', y: '15%', size: 45, speed: 0.2, opacity: 0.035, rotate: 15 },
        { type: 'line',   x: '8%',  y: '85%', size: 80, speed: -0.15, opacity: 0.03 },
      ]},
    ];

    var allDecoElements = [];

    decorations.forEach(function (cfg) {
      var parent = document.querySelector(cfg.parent);
      if (!parent) return;

      cfg.shapes.forEach(function (shape) {
        var el = document.createElement('div');
        el.className = 'parallax-deco';
        el.setAttribute('aria-hidden', 'true');

        var innerStyle = '';
        switch (shape.type) {
          case 'circle':
            innerStyle = 'border-radius:50%;background:currentColor;';
            break;
          case 'ring':
            innerStyle = 'border-radius:50%;border:2px solid currentColor;background:transparent;';
            break;
          case 'square':
            innerStyle = 'border:2px solid currentColor;background:transparent;';
            break;
          case 'line':
            innerStyle = 'height:2px !important;background:currentColor;';
            break;
          case 'dots':
            innerStyle = 'background-image:radial-gradient(circle,currentColor 1.5px,transparent 1.5px);' +
              'background-size:12px 12px;';
            break;
        }

        el.style.cssText =
          'position:absolute;pointer-events:none;z-index:0;color:var(--primary);' +
          'left:' + shape.x + ';top:' + shape.y + ';' +
          'width:' + shape.size + 'px;height:' + shape.size + 'px;' +
          'opacity:' + shape.opacity + ';' +
          'will-change:transform;transition:transform .1s linear;' +
          innerStyle;

        parent.appendChild(el);
        allDecoElements.push({ el: el, speed: shape.speed, rotate: shape.rotate || 0 });
      });
    });

    if (!allDecoElements.length) return;

    function update() {
      allDecoElements.forEach(function (item) {
        var progress = getViewportProgress(item.el);
        var shift = progress * item.speed * 150;
        var rotate = item.rotate ? ' rotate(' + item.rotate + 'deg)' : '';
        item.el.style.transform = 'translateY(' + shift + 'px)' + rotate;
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initStatGlow() {
    var stats = document.querySelectorAll('.stat');
    if (!stats.length) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          var el = m.target;
          if (el.classList.contains('counted')) {
            el.style.transition = 'background .6s ease';
            el.style.background = 'rgba(26,26,26,.02)';
            setTimeout(function () {
              el.style.background = '';
            }, 1200);
          }
        }
      });
    });

    stats.forEach(function (stat) {
      observer.observe(stat, { attributes: true });
    });
  }

  function initHeroTyping() {
    var eyebrow = document.querySelector('.hero-eyebrow');
    if (!eyebrow) return;

    var cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.style.cssText =
      'display:inline-block;margin-left:4px;animation:blink 1s step-end infinite;font-weight:300;opacity:.6;';

    eyebrow.appendChild(cursor);

    setTimeout(function () {
      cursor.style.transition = 'opacity .5s';
      cursor.style.opacity = '0';
      setTimeout(function () { cursor.remove(); }, 600);
    }, 4000);
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        var navHeight = 72;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      });
    });
  }

  function boot() {
    initEnhancedReveal();
    initTiltCards();
    initMagneticButtons();
    initHeroParallax();
    initSectionBgParallax();
    initDataParallax();
    initImageParallax();
    initHeadingParallax();
    initCardParallax();
    initStatParallax();
    initFloatShapeParallax();
    initDecorativeParallax();
    initScrollProgress();
    initStatGlow();
    initHeroTyping();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
