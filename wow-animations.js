'use strict';

/**
 * WOW Animations — MWW Mieszkanie
 * 3D tilt cards, magnetic buttons, parallax scrolling,
 * scroll progress bar, enhanced scroll reveal for new variants,
 * and listing card reveals for the oferty page.
 *
 * Respects prefers-reduced-motion and avoids heavy effects on touch devices.
 */

(function () {
  /* --- bail on reduced motion --- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* --- Configuration constants --- */
  var TILT_MAX_DEG = 5;       // max tilt rotation in degrees
  var MAGNETIC_STRENGTH = 0.15; // magnetic button follow strength
  var PARALLAX_SHIFT_PX = 30;  // max parallax shift in pixels

  /* ================================================================
     1. ENHANCED SCROLL REVEAL
     The base script.js handles .reveal. Here we also observe
     .reveal-left, .reveal-right, etc., and .section-header, .listing-card
     ================================================================ */

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

  /* ================================================================
     2. 3D TILT CARDS  (desktop only)
     Adds a subtle perspective tilt following the cursor.
     ================================================================ */

  function initTiltCards() {
    if (!isDesktop) return;

    var cards = document.querySelectorAll(
      '.dist-card, .service-card, .dev-card, .testimonial-card, .partner-card, .listing-card'
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

  /* ================================================================
     3. MAGNETIC BUTTONS  (desktop only)
     Buttons slightly follow the cursor when hovering near them.
     ================================================================ */

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

  /* ================================================================
     4. PARALLAX ON SCROLL
     Background images shift slightly as user scrolls.
     ================================================================ */

  function initParallax() {
    if (isTouchDevice) return; // parallax is janky on mobile

    var sections = document.querySelectorAll(
      '.about, .distinguishes, .services, .developer, .agent-section, .testimonials, .contact, .partners'
    );
    if (!sections.length) return;

    var ticking = false;

    function update() {
      var scrollY = window.scrollY;
      sections.forEach(function (section) {
        var before = section.querySelector('.bg-gradient-orb');
        if (!before) return;

        var rect = section.getBoundingClientRect();
        var offset = rect.top / window.innerHeight;
        var shift = offset * PARALLAX_SHIFT_PX;

        before.style.transform =
          'translate(-50%, calc(-50% + ' + shift + 'px))';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
  }

  /* ================================================================
     5. SCROLL PROGRESS BAR
     A thin bar at the top of the page showing scroll progress.
     ================================================================ */

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

  /* ================================================================
     6. SMOOTH APPEAR FOR STATS  (enhanced counting)
     Adds a glow effect to each stat when it finishes counting.
     ================================================================ */

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

  /* ================================================================
     7. TYPING EFFECT FOR HERO EYEBROW (optional, subtle)
     ================================================================ */

  function initHeroTyping() {
    var eyebrow = document.querySelector('.hero-eyebrow');
    if (!eyebrow) return;

    // We won't replace text, just add a blinking cursor
    var cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.style.cssText =
      'display:inline-block;margin-left:4px;animation:blink 1s step-end infinite;font-weight:300;opacity:.6;';

    eyebrow.appendChild(cursor);

    // Remove cursor after 4 seconds
    setTimeout(function () {
      cursor.style.transition = 'opacity .5s';
      cursor.style.opacity = '0';
      setTimeout(function () { cursor.remove(); }, 600);
    }, 4000);
  }

  /* ================================================================
     8. SMOOTH SCROLL ANCHOR LINKS
     ================================================================ */

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

  /* ================================================================
     BOOT
     ================================================================ */

  function boot() {
    initEnhancedReveal();
    initTiltCards();
    initMagneticButtons();
    initParallax();
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
