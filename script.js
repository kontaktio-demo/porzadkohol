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

function sanitizeInput(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

var _formSubmitCount = 0;
var _formLastSubmit = 0;

function initForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  var MAX_NAME_LEN = 100;
  var MAX_EMAIL_LEN = 254;
  var MAX_PHONE_LEN = 20;
  var MAX_MSG_LEN = 5000;
  var RATE_LIMIT_MS = 10000;
  var MAX_SUBMITS_PER_SESSION = 5;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn       = form.querySelector('button[type="submit"]');
    var nameEl    = form.querySelector('#fname');
    var emailEl   = form.querySelector('#femail');
    var phoneEl   = form.querySelector('#fphone');
    var msgEl     = form.querySelector('#fmessage');
    var gdprEl    = form.querySelector('#fgdpr');
    var honeypot  = form.querySelector('#fwebsite');
    var orig      = btn.textContent;

    clearError(nameEl);
    clearError(emailEl);
    if (phoneEl) clearError(phoneEl);
    if (msgEl) clearError(msgEl);
    if (gdprEl) clearError(gdprEl);

    // Honeypot check
    if (honeypot && honeypot.value) return;

    // Rate limiting
    var now = Date.now();
    if (now - _formLastSubmit < RATE_LIMIT_MS) {
      showError(btn.parentNode || form, 'Poczekaj chwilę przed ponownym wysłaniem.');
      shakeBtn(btn);
      return;
    }
    if (_formSubmitCount >= MAX_SUBMITS_PER_SESSION) {
      showError(btn.parentNode || form, 'Osiągnięto limit wysłanych wiadomości. Odśwież stronę.');
      shakeBtn(btn);
      return;
    }

    var nameVal  = (nameEl.value || '').trim();
    var emailVal = (emailEl.value || '').trim();
    var phoneVal = phoneEl ? (phoneEl.value || '').trim() : '';
    var msgVal   = msgEl ? (msgEl.value || '').trim() : '';

    var hasError = false;

    if (!nameVal) {
      showError(nameEl, 'Podaj imię i nazwisko.');
      hasError = true;
    } else if (nameVal.length > MAX_NAME_LEN) {
      showError(nameEl, 'Imię jest za długie (maks. ' + MAX_NAME_LEN + ' znaków).');
      hasError = true;
    } else if (/[<>{}]/.test(nameVal)) {
      showError(nameEl, 'Imię zawiera niedozwolone znaki.');
      hasError = true;
    }

    if (!emailVal) {
      showError(emailEl, 'Podaj adres e-mail.');
      hasError = true;
    } else if (emailVal.length > MAX_EMAIL_LEN) {
      showError(emailEl, 'Adres e-mail jest za długi.');
      hasError = true;
    } else if (!EMAIL_RE.test(emailVal)) {
      showError(emailEl, 'Podaj poprawny adres e-mail.');
      hasError = true;
    }

    if (phoneVal && phoneVal.length > MAX_PHONE_LEN) {
      showError(phoneEl, 'Numer telefonu jest za długi.');
      hasError = true;
    } else if (phoneVal && !/^[+\d\s()-]*$/.test(phoneVal)) {
      showError(phoneEl, 'Numer telefonu zawiera niedozwolone znaki.');
      hasError = true;
    }

    if (msgVal && msgVal.length > MAX_MSG_LEN) {
      showError(msgEl, 'Wiadomość jest za długa (maks. ' + MAX_MSG_LEN + ' znaków).');
      hasError = true;
    }

    if (gdprEl && !gdprEl.checked) {
      showError(gdprEl, 'Zaakceptuj zgodę na przetwarzanie danych.');
      hasError = true;
    }

    if (hasError) {
      shakeBtn(btn);
      return;
    }

    // Sanitize values
    nameVal = sanitizeInput(nameVal);
    emailVal = sanitizeInput(emailVal);
    phoneVal = sanitizeInput(phoneVal);
    msgVal = sanitizeInput(msgVal);

    _formSubmitCount++;
    _formLastSubmit = now;

    btn.textContent = 'Wysyłanie…';
    btn.disabled = true;

    setTimeout(function () {
      btn.textContent = 'Wiadomość wysłana ✓';
      btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      btn.style.color = '#fff';

      setTimeout(function () {
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

