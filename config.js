'use strict';

/*
 * ============================================================
 *  MWW Mieszkanie – Konfiguracja połączenia z backendem
 * ============================================================
 *
 *  Po wdrożeniu backendu na Render, zmień API_BASE_URL
 *  na adres Twojego serwera, np.:
 *    https://mww-backend.onrender.com
 *
 *  NIE dodawaj ukośnika na końcu URL-a.
 * ============================================================
 */

const MWW_CONFIG = Object.freeze({

  // Adres backendu (Render) — zmień po wdrożeniu
  // Podczas developmentu możesz użyć: 'http://localhost:3000'
  API_BASE_URL: 'https://backend-mww.onrender.com',

  // Endpointy API
  ENDPOINTS: Object.freeze({
    // Publiczny — lista aktywnych ofert (GET)
    OFFERS:        '/api/offers',
    // Admin — lista wszystkich ofert włącznie z nieaktywnymi (GET, wymaga tokenu)
    OFFERS_ALL:    '/api/offers/all',
    // Admin — dodaj ofertę (POST, wymaga tokenu), body: JSON oferty
    OFFERS_CREATE: '/api/offers',
    // Admin — edytuj ofertę (PATCH /api/offers/:id, wymaga tokenu)
    // Admin — usuń ofertę  (DELETE /api/offers/:id, wymaga tokenu)
    // Logowanie (POST), body: { username, password }
    AUTH_LOGIN:    '/api/auth/login',
    // Weryfikacja tokenu (GET, wymaga tokenu)
    AUTH_VERIFY:   '/api/auth/verify',
  }),

});
