'use strict';
(function (g) {
  var _k = 0x5A;
  function _d(b) {
    try {
      var s = atob(b);
      var o = '';
      for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ _k);
      return o;
    } catch (e) { return ''; }
  }
  var _b = _d('Mi4uKilgdXU4OzkxPzQ+dzctLXQ1NCg/ND4/KHQ5NTc=');
  var _o = _d('dTsqM3U1PDw/KCk=');

  var cfg = Object.freeze({
    get API_BASE_URL() { return _b; },
    ENDPOINTS: Object.freeze({
      get OFFERS() { return _o; },
    }),
  });

  Object.defineProperty(g, 'MWW_CONFIG', {
    value: cfg, writable: false, configurable: false, enumerable: false,
  });
})(typeof window !== 'undefined' ? window : this);
