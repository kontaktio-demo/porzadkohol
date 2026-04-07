'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initHamburger();
  initScrollReveal();
  initCounters();
  initForm();
  initStickyBar();
  initCookieConsent();
});

function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const hide = () => {
    preloader.classList.add('hidden');
    document.body.classList.remove('preloading');
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 800);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 800));
  }
}

function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  const open = () => {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? close() : open();
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', close));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') && !hamburger.contains(e.target) && !navLinks.contains(e.target)) close();
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

function initCounters() {
  const stats = document.querySelectorAll('.stat[data-count]');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el      = entry.target;
        const number  = el.querySelector('.stat-number');
        const target  = parseInt(el.dataset.count, 10);
        const suffix  = el.dataset.suffix || '';
        const dur     = 1600;
        const step    = 16;
        const steps   = dur / step;
        let   current = 0;

        const tick = () => {
          current = Math.min(current + target / steps, target);
          number.textContent = Math.floor(current) + suffix;
          if (current < target) requestAnimationFrame(tick);
          else el.classList.add('counted');
        };

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(stat => observer.observe(stat));
}

function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn      = form.querySelector('button[type="submit"]');
    const nameEl   = form.querySelector('#fname');
    const emailEl  = form.querySelector('#femail');
    const orig     = btn.textContent;
    const hasName  = nameEl.value.trim();
    const hasEmail = emailEl.value.trim();

    clearError(nameEl);
    clearError(emailEl);

    let hasError = false;
    if (!hasName)  { showError(nameEl,  'Please enter your name.');  hasError = true; }
    if (!hasEmail) { showError(emailEl, 'Please enter your email.'); hasError = true; }

    if (hasError) {
      shakeBtn(btn);
      return;
    }

    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Request Sent ✓';
      btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 4000);
    }, 900);
  });
}

function showError(input, message) {
  input.style.borderColor = '#ef4444';
  input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.20)';
  const msg = document.createElement('span');
  msg.className = 'field-error';
  msg.setAttribute('role', 'alert');
  msg.textContent = message;
  msg.style.cssText = 'display:block;font-size:.75rem;color:#ef4444;margin-top:4px;';
  input.parentNode.appendChild(msg);

  input.addEventListener('input', () => clearError(input), { once: true });
}

function clearError(input) {
  input.style.borderColor = '';
  input.style.boxShadow   = '';
  const msg = input.parentNode.querySelector('.field-error');
  if (msg) msg.remove();
}

function shakeBtn(btn) {
  btn.style.animation = 'shake .45s ease';
  btn.addEventListener('animationend', () => { btn.style.animation = ''; }, { once: true });
}

function initStickyBar() {
  const bar   = document.getElementById('stickyBar');
  const close = document.getElementById('stickyClose');
  if (!bar || !close) return;

  const KEY = 'kontaktio_sticky_closed';
  try { if (localStorage.getItem(KEY) === '1') return; } catch {}

  let shown = false;

  const update = () => {
    const should = window.scrollY > 900;
    if (should !== shown) {
      shown = should;
      bar.classList.toggle('on', should);
      bar.setAttribute('aria-hidden', String(!should));
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  close.addEventListener('click', () => {
    bar.classList.remove('on');
    bar.setAttribute('aria-hidden', 'true');
    try { localStorage.setItem(KEY, '1'); } catch {}
    window.removeEventListener('scroll', update);
  });
}

function initCookieConsent() {
  const consent = document.getElementById('cookieConsent');
  if (!consent) return;
  if (localStorage.getItem('mww_cookie_consent')) return;

  setTimeout(() => consent.classList.add('show'), 1200);

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('mww_cookie_consent', JSON.stringify({necessary:true, analytics:true, marketing:true}));
    consent.classList.remove('show');
  });

  document.getElementById('cookieReject').addEventListener('click', () => {
    localStorage.setItem('mww_cookie_consent', JSON.stringify({necessary:true, analytics:false, marketing:false}));
    consent.classList.remove('show');
  });

  document.getElementById('cookieCustomize').addEventListener('click', () => {
    const panel = document.getElementById('cookieCustomPanel');
    panel.hidden = !panel.hidden;
  });

  document.getElementById('cookieSave').addEventListener('click', () => {
    const analytics = document.getElementById('cookieAnalytics').checked;
    const marketing = document.getElementById('cookieMarketing').checked;
    localStorage.setItem('mww_cookie_consent', JSON.stringify({necessary:true, analytics, marketing}));
    consent.classList.remove('show');
  });
}
