'use strict';

(function () {

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var TILT_MAX_DEG = 5;
  var MAGNETIC_STRENGTH = 0.15;

  var enhancedObserver;
  var enhancedElements;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function initEnhancedReveal() {
    var selectors = [
      '.reveal-left', '.reveal-right', '.reveal-scale',
      '.reveal-flip', '.reveal-blur', '.reveal-rotate', '.reveal-zoom',
      '.section-header', '.listing-card'
    ];
    var nodeList = document.querySelectorAll(selectors.join(','));
    var unique = [];
    for (var i = 0; i < nodeList.length; i++) {
      if (!nodeList[i].classList.contains('reveal')) unique.push(nodeList[i]);
    }
    enhancedElements = unique;
    if (!enhancedElements.length) return;

    enhancedObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            enhancedObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    enhancedElements.forEach(function (el) { enhancedObserver.observe(el); });
  }

  function initTiltCards() {
    if (!isDesktop) return;

    var cards = document.querySelectorAll(
      '.dist-card, .testimonial-card, .partner-card, .listing-card'
    );

    cards.forEach(function (card) {
      card.classList.add('tilt-3d');
      var pendingX = 0, pendingY = 0, ticking = false;

      function apply() {
        ticking = false;
        var rect = card.getBoundingClientRect();
        var midX = rect.width / 2;
        var midY = rect.height / 2;
        var rotateY = ((pendingX - midX) / midX) * TILT_MAX_DEG;
        var rotateX = ((midY - pendingY) / midY) * TILT_MAX_DEG;
        card.style.transform =
          'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px) scale(1.01)';
      }

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        pendingX = e.clientX - rect.left;
        pendingY = e.clientY - rect.top;
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
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
      var pendingX = 0, pendingY = 0, ticking = false;

      function apply() {
        ticking = false;
        btn.style.transform =
          'translate(' + (pendingX * MAGNETIC_STRENGTH) + 'px,' + (pendingY * MAGNETIC_STRENGTH) + 'px) translateY(-3px) scale(1.02)';
      }

      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        pendingX = e.clientX - rect.left - rect.width / 2;
        pendingY = e.clientY - rect.top - rect.height / 2;
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var heroScroll = hero.querySelector('.hero-scroll');
    if (!heroScroll) return;

    var ticking = false;

    function update() {
      ticking = false;
      var scrollY = window.scrollY;
      // Only fade the scroll cue. We deliberately do NOT touch the hero
      // background or .hero-content here — those used to fight the
      // .reveal { ... !important } CSS rules and caused a visible jump
      // the moment the user started scrolling. The entrance animation
      // is now handled in pure CSS (see redesign.css §16b).
      heroScroll.style.opacity = clamp(1 - scrollY / 200, 0, 1);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      ticking = false;
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
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

  function boot() {
    initEnhancedReveal();
    initTiltCards();
    initMagneticButtons();
    initHeroParallax();
    initScrollProgress();
    initStatGlow();
    initHeroTyping();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
