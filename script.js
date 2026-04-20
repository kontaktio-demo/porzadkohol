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
  initTelConfirm();
  initSmoothAnchors();
  initBasicProtection();
});

function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const hide = () => {
    preloader.classList.add('hidden');
    document.body.classList.remove('preloading');
  };
  if (document.readyState === 'complete') setTimeout(hide, 800);
  else window.addEventListener('load', () => setTimeout(hide, 800));
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
  window.__scrollRevealReset = () => {
    elements.forEach(el => {
      el.classList.remove('visible');
      observer.observe(el);
    });
  };
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

/* ---------- FORM VALIDATION & ANTI-SPAM ---------- */
function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const created = Date.now();

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn      = form.querySelector('button[type="submit"]');
    const nameEl   = form.querySelector('#fname');
    const emailEl  = form.querySelector('#femail');
    const phoneEl  = form.querySelector('#fphone');
    const msgEl    = form.querySelector('#fmessage');
    const gdprEl   = form.querySelector('#fgdpr');
    const orig     = btn.textContent;

    [nameEl, emailEl, phoneEl, msgEl, gdprEl].forEach(el => el && clearError(el));

    let hasError = false;

    // Honeypot
    const trap = form.querySelector('input[name="website"]');
    if (trap && trap.value) { return; }
    // Time trap (form filled too fast = bot)
    if (Date.now() - created < 1500) { return; }

    // Name: 2-80 chars, allow letters, spaces, hyphens, polish chars
    const name = (nameEl.value || '').trim();
    if (!name || name.length < 2 || name.length > 80 ||
        !/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż][A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s'\-\.]{1,79}$/.test(name)) {
      showError(nameEl, 'Wpisz poprawne imię i nazwisko (2-80 znaków).'); hasError = true;
    }

    // Email: standard regex, max 254 chars
    const email = (emailEl.value || '').trim();
    if (!email || email.length > 254 ||
        !/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(email)) {
      showError(emailEl, 'Wpisz poprawny adres e-mail.'); hasError = true;
    }

    // Phone: optional, but if filled must look like a phone
    const phone = (phoneEl.value || '').trim();
    if (phone && (phone.length > 20 || !/^[\+0-9 ()\-]{7,20}$/.test(phone))) {
      showError(phoneEl, 'Wpisz poprawny numer telefonu.'); hasError = true;
    }

    // Message: 10-2000 chars
    const msg = (msgEl.value || '').trim();
    if (!msg || msg.length < 10 || msg.length > 2000) {
      showError(msgEl, 'Wiadomość powinna mieć 10-2000 znaków.'); hasError = true;
    }
    // Reject obvious URL spam
    if (msg && (msg.match(/https?:\/\//gi) || []).length > 2) {
      showError(msgEl, 'Wiadomość zawiera za dużo linków.'); hasError = true;
    }

    // GDPR
    if (!gdprEl.checked) {
      showError(gdprEl, 'Zgoda jest wymagana.'); hasError = true;
    }

    if (hasError) return;

    btn.textContent = 'Wysyłanie...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Wysłano';
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

  // Per-field max length enforcement
  const limits = { fname: 80, femail: 254, fphone: 20, fmessage: 2000 };
  Object.keys(limits).forEach(id => {
    const el = form.querySelector('#' + id);
    if (el && !el.maxLength) el.setAttribute('maxlength', String(limits[id]));
  });

  // Live filtering for the phone field: only digits, spaces, +, -, (, )
  // are allowed. This blocks letters and other garbage at typing time
  // (and also strips them out of pasted content) instead of waiting for
  // the submit-time validator to complain.
  const phoneInput = form.querySelector('#fphone');
  if (phoneInput) {
    phoneInput.setAttribute('inputmode', 'tel');
    phoneInput.setAttribute('pattern', '[+0-9 ()\\-]{7,20}');
    const sanitizePhone = () => {
      const before = phoneInput.value;
      const after = before.replace(/[^\d+\s()\-]/g, '');
      if (after !== before) {
        const pos = phoneInput.selectionStart;
        phoneInput.value = after;
        try { phoneInput.setSelectionRange(pos - (before.length - after.length), pos - (before.length - after.length)); } catch (_) {}
      }
    };
    phoneInput.addEventListener('input', sanitizePhone);
    phoneInput.addEventListener('paste', () => setTimeout(sanitizePhone, 0));
  }

  // Live trim for the name field: digits and obvious junk shouldn't be
  // typeable in a name. Allow letters (incl. Polish), spaces, hyphens,
  // apostrophes and periods.
  const nameInput = form.querySelector('#fname');
  if (nameInput) {
    const sanitizeName = () => {
      const before = nameInput.value;
      const after = before.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s'\-\.]/g, '');
      if (after !== before) {
        const pos = nameInput.selectionStart;
        nameInput.value = after;
        try { nameInput.setSelectionRange(pos - (before.length - after.length), pos - (before.length - after.length)); } catch (_) {}
      }
    };
    nameInput.addEventListener('input', sanitizeName);
    nameInput.addEventListener('paste', () => setTimeout(sanitizeName, 0));
  }
}

function showError(input, message) {
  if (input.type === 'checkbox') {
    const parent = input.closest('.form-group');
    if (parent) parent.style.color = '#ef4444';
    const old = parent && parent.querySelector('.field-error');
    if (old) old.remove();
    const msg = document.createElement('span');
    msg.className = 'field-error';
    msg.setAttribute('role', 'alert');
    msg.textContent = message;
    msg.style.cssText = 'display:block;font-size:.75rem;color:#ef4444;margin-top:4px;';
    parent && parent.appendChild(msg);
    input.addEventListener('change', () => clearError(input), { once: true });
    return;
  }
  input.style.borderColor = '#ef4444';
  input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.20)';
  const old = input.parentNode.querySelector('.field-error');
  if (old) old.remove();
  const msg = document.createElement('span');
  msg.className = 'field-error';
  msg.setAttribute('role', 'alert');
  msg.textContent = message;
  msg.style.cssText = 'display:block;font-size:.75rem;color:#ef4444;margin-top:4px;';
  input.parentNode.appendChild(msg);
  input.addEventListener('input', () => clearError(input), { once: true });
}

function clearError(input) {
  if (input.type === 'checkbox') {
    const parent = input.closest('.form-group');
    if (parent) parent.style.color = '';
    const msg = parent && parent.querySelector('.field-error');
    if (msg) msg.remove();
    return;
  }
  input.style.borderColor = '';
  input.style.boxShadow   = '';
  const msg = input.parentNode && input.parentNode.querySelector('.field-error');
  if (msg) msg.remove();
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
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax;Secure';
  }
  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax;Secure';
  }
  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? decodeURIComponent(v.pop()) : null;
  }
  function applyCookieConsent(prefs) {
    setCookie('mww_cookie_consent', JSON.stringify(prefs), 365);
    if (prefs.analytics) setCookie('mww_analytics', '1', 365); else deleteCookie('mww_analytics');
    if (prefs.marketing) setCookie('mww_marketing', '1', 365); else deleteCookie('mww_marketing');
  }
  if (getCookie('mww_cookie_consent')) return;
  setTimeout(() => consent.classList.add('show'), 1200);
  document.getElementById('cookieAccept').addEventListener('click', () => {
    applyCookieConsent({necessary:true, analytics:true, marketing:true});
    consent.classList.remove('show');
  });
  document.getElementById('cookieReject').addEventListener('click', () => {
    applyCookieConsent({necessary:true, analytics:false, marketing:false});
    consent.classList.remove('show');
  });
  document.getElementById('cookieCustomize').addEventListener('click', () => {
    const panel = document.getElementById('cookieCustomPanel');
    panel.hidden = !panel.hidden;
  });
  document.getElementById('cookieSave').addEventListener('click', () => {
    const analytics = document.getElementById('cookieAnalytics').checked;
    const marketing = document.getElementById('cookieMarketing').checked;
    applyCookieConsent({necessary:true, analytics, marketing});
    consent.classList.remove('show');
  });
}

/* ---------- TELEPHONE CONFIRMATION MODAL (mobile) ---------- */
function initTelConfirm() {
  const isMobile = matchMedia('(max-width: 900px)').matches || ('ontouchstart' in window);
  if (!isMobile) return;

  // Build modal
  const overlay = document.createElement('div');
  overlay.className = 'tel-confirm-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'telConfirmTitle');
  overlay.innerHTML = ''
    + '<div class="tel-confirm-modal">'
    + '  <div class="tel-confirm-icon" aria-hidden="true">'
    + '    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.09-1.08a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
    + '  </div>'
    + '  <h3 id="telConfirmTitle">Zadzwonić do MWW Mieszkanie?</h3>'
    + '  <span class="tel-confirm-num" id="telConfirmNum"></span>'
    + '  <p>Pierwsza rozmowa jest bezpłatna i niezobowiązująca.</p>'
    + '  <div class="tel-confirm-actions">'
    + '    <button type="button" class="btn btn-outline" data-tc-cancel>Anuluj</button>'
    + '    <a href="#" class="btn btn-primary" data-tc-confirm>Zadzwoń</a>'
    + '  </div>'
    + '</div>';
  document.body.appendChild(overlay);

  const numEl    = overlay.querySelector('#telConfirmNum');
  const okBtn    = overlay.querySelector('[data-tc-confirm]');
  const cancelBtn= overlay.querySelector('[data-tc-cancel]');

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function open(href) {
    okBtn.setAttribute('href', href);
    const display = (href.replace(/^tel:/, '').replace(/[^\d+]/g, ''))
      .replace(/^(\+\d{2})(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4');
    numEl.textContent = display;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => okBtn.focus(), 50);
  }
  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  okBtn.addEventListener('click', () => { setTimeout(close, 300); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="tel:"]');
    if (!a) return;
    e.preventDefault();
    open(a.getAttribute('href'));
  }, true);
}

/* ---------- SMOOTH IN-PAGE ANCHOR SCROLL (account for sticky nav) ---------- */
function initSmoothAnchors() {
  const navEl = document.getElementById('nav');
  function navOffset() {
    return (navEl ? navEl.offsetHeight : 78) + 16;
  }
  function scrollToId(id, smooth) {
    const target = document.getElementById(id);
    if (!target) return false;
    const top = target.getBoundingClientRect().top + window.pageYOffset - navOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
    return true;
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    // Same-page anchor
    let id = '';
    if (href.startsWith('#')) id = href.slice(1);
    else {
      try {
        const u = new URL(href, location.href);
        if (u.pathname === location.pathname && u.hash) id = u.hash.slice(1);
      } catch {}
    }
    if (!id) return;
    if (!document.getElementById(id)) return;
    e.preventDefault();
    scrollToId(id, true);
    history.replaceState(null, '', '#' + id);
  });

  // Re-apply offset when the page is opened directly with a #hash, because
  // the browser's native jump happens before the fixed nav height is known.
  if (location.hash && location.hash.length > 1) {
    const id = decodeURIComponent(location.hash.slice(1));
    // Run after layout settles (fonts, images above the fold).
    requestAnimationFrame(() => {
      scrollToId(id, false);
      // One more pass after a short delay in case late layout shifts occurred.
      setTimeout(() => scrollToId(id, false), 250);
    });
  }
}

/* ---------- BASIC FRONT-END PROTECTION ----------
 * The actual hardening lives in `mww-shield.js`, which is included
 * on every page so the marketing site does not leak stack traces
 * or internal endpoints to casual visitors. Kept here as a no-op
 * for backward compatibility with the original boot sequence. */
function initBasicProtection() { /* handled by mww-shield.js */ }
