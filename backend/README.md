# MWW Backend – API + Panel Admina

Kompletny backend API i panel administracyjny dla strony nieruchomości **MWW Mieszkanie**.

---

## 📁 Struktura projektu

```
backend/                ← Backend API (Node.js + Express + MongoDB)
├── server.js           ← Główny plik serwera
├── package.json        ← Zależności
├── seed.js             ← Skrypt tworzący konto admina
├── render.yaml         ← Konfiguracja Render Blueprint
├── .env.example        ← Przykładowy plik zmiennych środowiskowych
├── models/
│   ├── Offer.js        ← Model oferty (Mongoose)
│   └── User.js         ← Model użytkownika
├── routes/
│   ├── auth.js         ← Endpointy logowania i autoryzacji
│   ├── offers.js       ← CRUD ofert + filtrowanie, sortowanie
│   └── images.js       ← Upload i przetwarzanie zdjęć (AVIF/WebP)
├── middleware/
│   └── auth.js         ← Middleware JWT
├── utils/
│   └── imageProcessor.js ← Sharp – konwersja do AVIF/WebP + miniaturki
└── uploads/            ← Przesłane zdjęcia (dysk Render)

admin/                  ← Panel administracyjny (statyczny HTML/CSS/JS)
├── index.html          ← Główna strona panelu
├── admin.css           ← Style panelu
├── admin.js            ← Logika panelu (SPA)
└── admin-config.js     ← Konfiguracja (adres API)
```

---

## 🚀 Jak uruchomić lokalne (development)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edytuj .env – ustaw MONGODB_URI (np. z MongoDB Atlas)
npm install
npm run seed    # Tworzy konto admina (domyślnie: mww / MWW2024!Secure)
npm start       # Uruchomi serwer na http://localhost:3000
```

### 2. Panel Admina

Panel to statyczne pliki HTML – wystarczy otworzyć `admin/index.html` w przeglądarce lub uruchomić dowolny serwer statycznych plików:

```bash
cd admin
npx serve .
# Otworzy się na http://localhost:3000 (lub innym porcie)
```

W pliku `admin/admin-config.js` ustaw `API_BASE_URL` na adres backendu.

### 3. Frontend (strona główna)

W pliku `config.js` na stronie głównej ustaw `API_BASE_URL` na adres backendu.

---

## 🌐 Wdrożenie na Render.com

### Backend (Web Service)

1. **Stwórz nowe repo na GitHub** i wrzuć zawartość folderu `backend/`.

2. **Zaloguj się na render.com** i kliknij **"New" → "Web Service"**.

3. **Połącz repo** z backendem.

4. **Konfiguracja serwisu:**

   | Pole | Wartość |
   |---|---|
   | **Name** | `mww-backend` |
   | **Region** | Frankfurt (EU) |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | Free (lub Starter dla produkcji) |

5. **Zmienne środowiskowe** (Environment → Add Environment Variable):

   | Klucz | Wartość |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/mww?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Długi losowy ciąg znaków (min. 32 znaki) – kliknij "Generate" |
   | `JWT_EXPIRES_IN` | `24h` |
   | `CORS_ORIGINS` | `https://twoja-strona.pl,https://admin.twoja-strona.pl` |
   | `ADMIN_USERNAME` | `mww` |
   | `ADMIN_PASSWORD` | Bezpieczne hasło (zmień!) |
   | `MAX_FILE_SIZE_MB` | `10` |
   | `IMAGE_FORMAT` | `both` |
   | `IMAGE_QUALITY` | `80` |
   | `IMAGE_MAX_WIDTH` | `1920` |
   | `THUMB_MAX_WIDTH` | `400` |

6. **Dysk (Disk) – WAŻNE dla zdjęć:**
   - Kliknij **"Advanced" → "Add Disk"**
   - **Name:** `mww-uploads`
   - **Mount Path:** `/opt/render/project/src/uploads`
   - **Size:** 1 GB (na Free plan max 1 GB)

7. **Kliknij "Create Web Service"** – Render zbuduje i uruchomi serwer.

8. **Po wdrożeniu**, uruchom seed (jednorazowo):
   - W panelu Render otwórz **Shell** (zakładka) i wpisz:
   ```bash
   npm run seed
   ```
   Lub możesz to zrobić lokalnie z `MONGODB_URI` ustawionym na Atlas.

### Panel Admina (Static Site)

1. **Stwórz nowe repo** i wrzuć zawartość folderu `admin/`.

2. Na Render: **"New" → "Static Site"**.

3. **Konfiguracja:**

   | Pole | Wartość |
   |---|---|
   | **Name** | `mww-admin` |
   | **Build Command** | (puste – nie trzeba budować) |
   | **Publish Directory** | `.` |

4. **Przed wdrożeniem**, edytuj `admin-config.js`:
   ```js
   API_BASE_URL: 'https://mww-backend.onrender.com'
   ```
   Zamień na faktyczny URL backendu z Render.

5. **Ustaw własną domenę** (opcjonalnie):
   - W ustawieniach serwisu dodaj **Custom Domain**, np. `admin.mwwmieszkanie.pl`
   - Dodaj odpowiedni rekord CNAME w DNS

### Frontend (strona główna)

Na stronie głównej zaktualizuj `config.js`:
```js
API_BASE_URL: 'https://mww-backend.onrender.com'
```

---

## 📡 API – Endpointy

### Publiczne (bez autoryzacji)

| Metoda | Endpoint | Opis |
|---|---|---|
| `GET` | `/api/offers` | Lista aktywnych ofert (z filtrami i sortowaniem) |
| `GET` | `/api/offers/stats` | Statystyki ofert |
| `GET` | `/api/offers/:id` | Pojedyncza oferta (po ID lub slug) |
| `GET` | `/api/health` | Health check |
| `GET` | `/uploads/:filename` | Zdjęcia (statyczne pliki) |

**Query params dla `/api/offers`:**
- `type` – `sprzedaz` / `wynajem`
- `category` – `mieszkanie`, `dom`, `dzialka`, `lokal`, `biuro`, `garaz`, `magazyn`, `inne`
- `city`, `district` – szukaj po mieście/dzielnicy
- `priceMin`, `priceMax` – zakres cen
- `areaMin`, `areaMax` – zakres powierzchni
- `rooms` – liczba pokoi (4 = 4+)
- `q` – wyszukiwanie tekstowe (tytuł, adres, opis)
- `sort` – `price-asc`, `price-desc`, `area-asc`, `area-desc`, `newest`, `oldest`, `featured`
- `page`, `limit` – paginacja
- `featured` – `true` (tylko wyróżnione)
- `meta` – `true` (zwraca z metadanymi paginacji)

### Admin (wymagana autoryzacja JWT)

| Metoda | Endpoint | Opis |
|---|---|---|
| `POST` | `/api/auth/login` | Logowanie → `{ token, user }` |
| `GET` | `/api/auth/verify` | Weryfikacja tokenu |
| `POST` | `/api/auth/change-password` | Zmiana hasła |
| `GET` | `/api/offers/all` | Wszystkie oferty (aktywne + nieaktywne) |
| `POST` | `/api/offers` | Dodaj ofertę |
| `PATCH` | `/api/offers/:id` | Edytuj ofertę |
| `PUT` | `/api/offers/:id` | Pełna aktualizacja oferty |
| `DELETE` | `/api/offers/:id` | Usuń ofertę |
| `PATCH` | `/api/offers/:id/toggle` | Zmień status aktywna/nieaktywna |
| `PATCH` | `/api/offers/:id/featured` | Zmień status wyróżniona |
| `POST` | `/api/offers/:id/images` | Dodaj zdjęcia do oferty |
| `DELETE` | `/api/offers/:id/images/:idx` | Usuń zdjęcie z oferty |
| `POST` | `/api/images/upload` | Upload pojedynczego zdjęcia → AVIF + WebP |
| `POST` | `/api/images/upload-multiple` | Upload wielu zdjęć (max 20) |

**Autoryzacja:** Header `Authorization: Bearer <token>`

---

## 🖼️ Przetwarzanie zdjęć

Każde przesłane zdjęcie jest automatycznie:

1. **Skalowane** do max 1920px szerokości (konfigurowane)
2. **Konwertowane** do:
   - **WebP** (pełny rozmiar + miniaturka 400px)
   - **AVIF** (pełny rozmiar + miniaturka 400px)
   - **JPEG** (miniaturka)
3. **Oryginał** jest zachowywany

Konfiguracja w `.env`:
- `IMAGE_FORMAT` – `webp`, `avif`, lub `both` (domyślnie: `both`)
- `IMAGE_QUALITY` – jakość 1-100 (domyślnie: 80)
- `IMAGE_MAX_WIDTH` – max szerokość (domyślnie: 1920px)
- `THUMB_MAX_WIDTH` – max szerokość miniaturki (domyślnie: 400px)

---

## 📋 Pola oferty

### Wymagane (required)
- **type** – `sprzedaz` / `wynajem`
- **category** – `mieszkanie`, `dom`, `dzialka`, `lokal`, `biuro`, `garaz`, `magazyn`, `inne`
- **title** – tytuł oferty (max 200 znaków)
- **price** – cena (liczba)
- **area** – powierzchnia w m² (liczba)
- **address** – pełny adres

### Opcjonalne
- **currency** – waluta/okres (domyślnie: PLN)
- **rooms** – liczba pokoi
- **floor**, **totalFloors** – piętro / łączna liczba pięter
- **yearBuilt** – rok budowy
- **buildingType** – rodzaj budynku
- **buildingMaterial** – materiał budynku
- **heatingType** – rodzaj ogrzewania
- **condition** – stan nieruchomości
- **parking** – rodzaj parkingu
- **balcony**, **terrace**, **garden**, **elevator**, **basement**, **furnished** – cechy (boolean)
- **plotArea**, **plotType**, **utilities**, **fencing** – dane działki
- **city**, **district**, **street** – szczegóły lokalizacji
- **latitude**, **longitude** – współrzędne GPS
- **desc**, **shortDesc** – opisy
- **images** – tablica zdjęć (WebP/AVIF/oryginał + miniaturki)
- **img** – URL głównego zdjęcia (kompatybilność wstecz)
- **features** – dodatkowe cechy (tablica stringów)
- **rent**, **deposit** – czynsz, kaucja
- **agentName**, **agentPhone**, **agentEmail** – dane agenta
- **refNumber** – numer referencyjny
- **source**, **sourceUrl** – źródło oferty
- **videoUrl**, **virtualTourUrl** – linki do mediów
- **availableFrom** – data dostępności
- **active** – czy oferta jest widoczna publicznie
- **featured** – czy wyróżniona
- **slug** – auto-generowany URL-friendly slug
- **metaTitle**, **metaDescription** – SEO

---

## 🔐 Bezpieczeństwo

- **JWT** z konfigurowalnym czasem ważności
- **bcrypt** (12 rund) do hashowania haseł
- **Helmet** – zabezpieczenia nagłówków HTTP
- **Rate limiting** – 200 żądań/15min ogólnie, 15 prób logowania/15min
- **CORS** – konfigurowalny whitelist originów
- **Multer** – walidacja typów plików i rozmiarów
- **Mongoose validation** – walidacja danych na poziomie modelu

---

## ⚙️ Notatki do konfiguracji Render

### MongoDB Atlas (baza danych)

1. Wejdź na [mongodb.com/atlas](https://www.mongodb.com/atlas) i stwórz darmowy klaster (Free Tier M0)
2. Stwórz użytkownika bazy danych
3. W **Network Access** dodaj `0.0.0.0/0` (pozwól na połączenia z dowolnego IP – potrzebne dla Render)
4. Skopiuj **Connection String** i wklej jako `MONGODB_URI` w Render

### Ważne opcje w Render:

- **Region:** `Frankfurt` (najbliżej Polski)
- **Plan:** `Free` do testów, `Starter` ($7/mies) dla produkcji (nie usypia po 15 min nieaktywności)
- **Disk:** Koniecznie dodaj dysk dla zdjęć (`/opt/render/project/src/uploads`, min 1 GB)
- **Auto-Deploy:** Włączone – każdy push do main automatycznie wdraża
- **Health Check Path:** `/api/health`

### Kolejność wdrażania:

1. Wrzuć `backend/` do repo → wdroż na Render jako Web Service
2. Uruchom `npm run seed` w Shell na Render
3. Skopiuj URL backendu (np. `https://mww-backend.onrender.com`)
4. Zaktualizuj `admin/admin-config.js` z URL backendu
5. Wrzuć `admin/` do repo → wdroż na Render jako Static Site
6. Zaktualizuj `config.js` na stronie głównej z URL backendu

### Testowanie:

Po wdrożeniu sprawdź:
```bash
# Health check
curl https://mww-backend.onrender.com/api/health

# Logowanie
curl -X POST https://mww-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mww","password":"MWW2024!Secure"}'

# Lista ofert (publiczna)
curl https://mww-backend.onrender.com/api/offers
```

---

## 🎨 Panel Admina – Funkcjonalności

- **Dashboard** – statystyki ofert, kategorie, ostatnio dodane
- **Lista ofert** – wyszukiwanie, filtrowanie, sortowanie, tabela z miniaturkami
- **Dodawanie oferty** – pełny formularz ze wszystkimi polami
- **Edycja oferty** – w tym samym formularzu z prefillowanymi danymi
- **Upload zdjęć** – drag & drop, automatyczna konwersja AVIF/WebP, podgląd miniaturek
- **Podgląd ofert** – tak jak wyglądają na stronie (karty + widok szczegółowy)
- **Toggle aktywna/nieaktywna** – jednym kliknięciem
- **Toggle wyróżniona** – jednym kliknięciem
- **Usuwanie ofert** – z potwierdzeniem
- **Zmiana hasła** – w ustawieniach
- **Health check** – status backendu
- **Responsywny design** – działa na telefonie
- **Lightbox** – powiększanie zdjęć
- **Toast notifications** – potwierdzenia akcji
- **Autentykacja JWT** – bezpieczne logowanie
