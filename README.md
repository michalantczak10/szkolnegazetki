# Galaretkarnia 🍮

Strona internetowa sklepu z tradycyjną galaretką z nóżek.

## 📋 Opis

Galaretkarnia to prosta, responsywna strona e-commerce oferująca najlepszą tradycyjną galaretką z nóżek w Polsce. Projekt wykorzystuje TypeScript dla typowania i bezpieczeństwa kodu.

## 🚀 Funkcjonalności

- **Dynamiczny koszyk zakupowy** - dodawanie produktów z automatycznym przeliczaniem
- **Checkout z walidacją** - walidacja telefonu, paczkomatu i uwag
- **Animacje** - płynne animacje przy dodawaniu produktów
- **Responsywny design** - działa na wszystkich urządzeniach
- **Dostępność (a11y)** - ARIA labels, focus states dla czytników ekranu
- **SEO** - zoptymalizowane metatagi
- **MongoDB** - pełna archiwizacja zamówień
- **Powiadomienia email** - automatyczne maile o nowych zamówieniach

## 🌐 Quick Start - Deployment

Chcesz od razu wdrożyć aplikację na produkcję?

**📘 [Kompletny przewodnik deployment →](DEPLOYMENT-GUIDE.md)**

- Backend → Render.com (darmowy)
- Frontend → Vercel (darmowy)
- Database → MongoDB Atlas (darmowy)

Czas setup: **~15 minut**

## 🌿 Workflow gałęzi

Aktualny model pracy:

- `develop` - codzienna praca i testy zmian
- `main` - wyłącznie release na produkcję

Zasady:

1. Każdą zmianę przygotuj i zweryfikuj na `develop`.
2. Na produkcję wypychaj tylko po merge do `main`.
3. Każdy push na `main` uruchamia automatyczny smoke test produkcyjny.
4. Monitoring health-check działa cyklicznie co 15 minut i zgłasza alert przez GitHub Issue.

## 🛠️ Technologie

- **Frontend**: TypeScript, CSS3, HTML5
- **Backend**: Node.js + Express
- **Baza danych**: MongoDB (archiwizacja zamówień)
- **Email**: Resend API

## 📦 Instalacja

### Frontend

1. Sklonuj repozytorium:
```bash
git clone https://github.com/michalantczak10/galaretkarnia.git
cd galaretkarnia
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Kompiluj TypeScript:
```bash
npm run build
```

### Backend

1. Przejdź do folderu `server`:
```bash
cd server
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj `.env` (patrz sekcja poniżej)

## ⚙️ Konfiguracja

### MongoDB

Backend wymaga MongoDB. Masz dwie opcje:

#### Opcja 1: Lokalne (localhost)
```bash
# Zainstaluj MongoDB Community Edition
# https://www.mongodb.com/docs/manual/installation/

# Uruchom MongoDB
mongod

# W .env ustaw:
MONGODB_URI=mongodb://localhost:27017/galaretkarnia
```

#### Opcja 2: MongoDB Cloud (Atlas) - rekomendowane dla produkcji
```bash
# Wejdź na https://www.mongodb.com/cloud/atlas
# Utwórz darmowe konto
# Skopiuj connection string
# W .env ustaw:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/galaretkarnia?retryWrites=true&w=majority
```

### Email (Resend)

Backend wysyła email z powiadomieniem o każdym nowym zamówieniu.

**📧 [Szczegółowa instrukcja konfiguracji email →](EMAIL-SETUP.md)**

Szybka konfiguracja:
1. W `server/.env` ustaw klucz Resend i adres odbioru zamówień
```env
RESEND_API_KEY=re_twoj_klucz_api
ORDER_EMAIL=kontakt@galaretkarnia.pl
```

**Uwaga**: Zamówienia są zapisywane w MongoDB niezależnie od konfiguracji email!

## 🏃 Uruchomienie

### Dla developmentu
```bash
# uruchom frontend + backend równolegle
npm install
npm run dev
```
Otwórz `http://localhost:5173` w przeglądarce.

### Dla produkcji - Frontend
```bash
npm run build
# Wynikowe pliki w: client/dist
```

## 🧪 Testy E2E

Projekt ma dwa profile testów Playwright:

1. `smoke` - szybkie testy bez efektów ubocznych (bez tworzenia realnych zamówień):
```bash
npm run test:e2e:smoke
```

2. `live` - testy realnego checkoutu (tworzą prawdziwe zamówienia):
```bash
npm run test:e2e:live
```

3. `prod smoke` - szybkie testy produkcji bez tworzenia realnych zamówień:
```bash
npm run test:prod:smoke
```

Automatyzacja CI:

- Workflow `Production Smoke` uruchamia `npm run test:prod:smoke` po każdym pushu na `main`.
- Workflow `Production Health Monitor` sprawdza `GET /api/health` co 15 minut.

Opcjonalnie możesz wskazać inny URL:
```bash
PROD_BASE_URL=https://twoj-url npm run test:prod:smoke
```

### Izolacja testów i produkcji na jednym klastrze MongoDB

Jeśli używasz tylko jednego klastra MongoDB Free, testy live są odseparowane logicznie:

1. `NODE_ENV=test` używa osobnej kolekcji (`orders_test` domyślnie).
2. Możesz ustawić osobny adres odbioru maili testowych (`ORDER_EMAIL_TEST`).
3. Testowe zamówienia mają automatyczny cleanup przez TTL (`TEST_ORDER_TTL_DAYS`).

Konfiguracja znajduje się w:

1. `server/.env.example`
2. `server/server.mjs`
3. `playwright.live.config.ts`

### Generowanie favicon

Skrypt `scripts/generate-favicons.cjs` konwertuje wektorowe `img/branding/logo-galaretkarnia.svg` na zestaw ikon (PNG, `favicon.ico`) i zapisuje je do katalogu `favicon/`.

Wymagania: zainstalowane pakiety `sharp` i `to-ico`.

Uwaga: skrypt został przeniesiony do `tools/generate-favicons/`.

Uruchom lokalnie:
```bash
# w katalogu projektu
npm install
npm run generate:favicons
# lub bezpośrednio
node ./tools/generate-favicons/generate-favicons.cjs
```

W CI (przykład):
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: '18'
- run: npm ci
- run: npm run generate:favicons
```

## 📂 Struktura projektu

```
galaretkarnia.pl/
├── client/                 # Frontend (Vite + TypeScript)
│   ├── index.html
│   ├── app.ts
│   ├── style.css
│   ├── terms.html
│   ├── privacy.html
│   └── ...
├── package.json            # Konfiguracja npm
├── tsconfig.json           # Konfiguracja TypeScript
└── server/                 # Backend (Node.js + Express)
    ├── server.mjs          # API serwera
  ├── test-server.mjs     # Start backendu w trybie testowym
    ├── .env                # Zmienne środowiska (lokalne)
    ├── .env.example        # Szablon .env
    └── package.json        # Zależności backendu
```

## 🔌 API Endpoints

### Zamówienia

**POST `/api/orders`** - Złóż nowe zamówienie
```json
{
  "phone": "512345678",
  "parcelLockerCode": "WAW01A",
  "paymentMethod": "bank_transfer",
  "notes": "Proszę dostarczyć po 18:00",
  "items": [
    {"name": "Galaretka drobiowa", "price": 18, "qty": 2}
  ],
  "productsTotal": 36,
  "deliveryCost": 15,
  "total": 51
}

### Health check

**GET `/api/health`** - Status API i bazy danych
```

## 🧹 Lokalny housekeeping

Szybki przegląd stanu lokalnego środowiska:

```bash
npm run ops:local:check
```

Automatyczne usunięcie lokalnych gałęzi, które są już zmergowane:

```bash
npm run ops:local:cleanup
```

**GET `/api/orders`** - Pobierz wszystkie zamówienia (admin)

**GET `/api/orders/id/:orderId`** - Pobierz szczegóły zamówienia

**PUT `/api/orders/id/:orderId`** - Zmień status zamówienia
```json
{
  "status": "w-realizacji"  // nowe | w-realizacji | gotowe | anulowane
}
```

## 💾 Schemat Zamówienia

Każde zamówienie w MongoDB zawiera:
```json
{
  "_id": "ObjectId",
  "phone": "string",
  "parcelLockerCode": "string",
  "notes": "string",
  "items": [
    {"name": "string", "price": "number", "qty": "number"}
  ],
  "total": "number",
  "status": "oczekuje-na-platnosc|oplacone|w-realizacji|gotowe|anulowane",
  "paymentStatus": "oczekiwanie-na-wplate",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 🎨 Produkty

1. **Galaretka drobiowa** - tradycyjna receptura z warzywami (18 zł)
2. **Galaretka wieprzowa** - tradycyjna receptura z warzywami (19 zł)

## 🔧 Konfiguracja

Kolory i inne zmienne można łatwo dostosować w `:root` w pliku `style.css`:

```css
:root {
  --color-primary: #b30000;
  --color-accent: #ffcc00;
  --color-bg: #fff8f0;
  /* ... */
}
```

## 📱 Responsywność

Strona jest w pełni responsywna z breakpointami:
- Mobile: < 480px
- Tablet: < 768px  
- Desktop: > 768px

## ♿ Dostępność

Projekt spełnia standardy dostępności:
- ARIA labels dla wszystkich interaktywnych elementów
- Focus states dla nawigacji klawiaturą
- Semantyczny HTML
- Odpowiedni kontrast kolorów

## 📄 Licencja

MIT

## 👨‍💻 Autor

Galaretkarnia.pl © 2026
