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
      '.dist-card, .partner-card, .listing-card'
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

  function initPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (!document.body.classList.contains('preloading')) {
      document.body.classList.add('page-entering');
      setTimeout(function () { document.body.classList.remove('page-entering'); }, 700);
    }

    var overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    function isInternalNavigable(a) {
      if (!a || !a.href) return false;
      if (a.target && a.target !== '' && a.target !== '_self') return false;
      if (a.hasAttribute('download')) return false;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#') return false;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
      var url;
      try { url = new URL(a.href, location.href); } catch (_) { return false; }
      if (url.origin !== location.origin) return false;
      if (url.pathname === location.pathname && url.search === location.search) return false;
      return true;
    }

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a');
      if (!isInternalNavigable(a)) return;

      e.preventDefault();
      var dest = a.href;
      overlay.classList.add('is-active');
      setTimeout(function () { window.location.href = dest; }, 280);
    }, false);

    window.addEventListener('pageshow', function (ev) {
      overlay.classList.remove('is-active');
      if (ev.persisted) {
        document.body.classList.add('page-entering');
        setTimeout(function () { document.body.classList.remove('page-entering'); }, 700);
      }
    });
  }

  function initSmoothAnchorScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var navEl = document.getElementById('nav');
    function navOffset() { return (navEl ? navEl.offsetHeight : 78) + 16; }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    var animating = false;
    function smoothScrollTo(targetY, duration) {
      if (animating) return;
      animating = true;
      var startY = window.scrollY || window.pageYOffset;
      var diff = targetY - startY;
      if (Math.abs(diff) < 2) { animating = false; window.scrollTo(0, targetY); return; }
      var dur = Math.max(450, Math.min(duration || (300 + Math.min(Math.abs(diff), 1400) * 0.55), 1300));
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var elapsed = ts - start;
        var t = Math.min(1, elapsed / dur);
        var eased = easeOutCubic(t);
        window.scrollTo(0, startY + diff * eased);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          animating = false;
        }
      }
      requestAnimationFrame(step);
    }

    document.documentElement.style.scrollBehavior = 'auto';

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var id = '';
      if (href.charAt(0) === '#') {
        id = href.slice(1);
      } else {
        try {
          var u = new URL(a.href, location.href);
          if (u.pathname === location.pathname && u.hash) id = u.hash.slice(1);
        } catch (_) { return; }
      }
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();
      var top = target.getBoundingClientRect().top + window.pageYOffset - navOffset();
      smoothScrollTo(Math.max(0, top));
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
    }, true);
  }

  function boot() {
    initEnhancedReveal();
    initTiltCards();
    initMagneticButtons();
    initHeroParallax();
    initScrollProgress();
    initStatGlow();
    initHeroTyping();
    initSmoothAnchorScroll();
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
