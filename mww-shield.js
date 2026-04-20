'use strict';
(function () {
  function isEditable(t) {
    if (!t) return false;
    var n = t.tagName;
    return n === 'INPUT' || n === 'TEXTAREA' || t.isContentEditable === true;
  }

  document.addEventListener('contextmenu', function (e) {
    if (isEditable(e.target)) return;
    e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'F12') { e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey &&
        (k === 'I' || k === 'J' || k === 'C' || k === 'i' || k === 'j' || k === 'c')) {
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && (k === 'U' || k === 'u' || k === 'S' || k === 's')) {
      e.preventDefault();
    }
  });

  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });

  try {
    var noop = function () {};
    var methods = ['log', 'info', 'warn', 'error', 'debug', 'trace',
                   'table', 'dir', 'group', 'groupEnd', 'groupCollapsed', 'count'];
    for (var i = 0; i < methods.length; i++) {
      try { console[methods[i]] = noop; } catch (_) {}
    }
  } catch (_) {}

  window.addEventListener('error', function (e) {
    try { e.preventDefault(); } catch (_) {}
    return true;
  });
  window.addEventListener('unhandledrejection', function (e) {
    try { e.preventDefault(); } catch (_) {}
  });
})();
