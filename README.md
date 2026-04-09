# Galaretkarnia 🍮

Strona internetowa sklepu z tradycyjną galaretką z nóżek.

## 📋 Opis

Galaretkarnia to prosta, responsywna strona e-commerce oferująca tradycyjną galaretkę z nóżek. Projekt wykorzystuje TypeScript dla typowania i bezpieczeństwa kodu.

## 🚀 Funkcjonalności

- **Dynamiczny koszyk zakupowy** - dodawanie produktów z automatycznym przeliczaniem
- **Checkout z walidacją** - walidacja telefonu, paczkomatu i uwag
- **Animacje** - płynne animacje przy dodawaniu produktów
- **Responsywny design** - działa na wszystkich urządzeniach
- **Dostępność (a11y)** - etykiety ARIA i stany focus dla czytników ekranu
- **SEO** - zoptymalizowane metatagi
- **MongoDB** - pełna archiwizacja zamówień
- **Powiadomienia e-mail** - automatyczne wiadomości o nowych zamówieniach
- **Konta użytkowników (MVP)** - rejestracja, logowanie i historia własnych zamówień

## 🌐 Quick Start - Deployment

Chcesz od razu wdrożyć aplikację na produkcję?

**📘 [Kompletny przewodnik wdrożenia →](DEPLOYMENT-GUIDE.md)**

- Backend → Render.com (darmowy)
- Frontend → Vercel (darmowy)
- Baza danych → MongoDB Atlas (darmowy)

Czas konfiguracji: **~15 minut**

## 🌿 Workflow gałęzi

Aktualny model pracy:

- `develop` - codzienna praca i testy zmian
- `main` - wyłącznie release na produkcję

Zasady:

1. Każdą zmianę przygotuj i zweryfikuj na `develop`.
2. Na produkcję wypychaj tylko po merge do `main`.
3. Każdy push na `main` uruchamia automatyczny smoke test produkcyjny.
4. Monitoring health check działa cyklicznie co 15 minut jako pasywna kontrola stanu API.

## 🛠️ Technologie

- **Frontend**: Vite, TypeScript, CSS3, HTML5
- **Backend**: Node.js + Express
- **Baza danych**: MongoDB (archiwizacja zamówień)
- **Email**: Resend API
- **Testy E2E**: Playwright

## 📦 Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/michalantczak10/galaretkarnia.git
cd galaretkarnia
```

2. Zainstaluj zależności dla wszystkich części projektu:
```bash
npm install
npm install --prefix client
npm install --prefix server
```

3. Skonfiguruj plik środowiskowy backendu:
```bash
copy server/.env.example server/.env
```

4. Uzupełnij zmienne w `server/.env` (patrz sekcja konfiguracji niżej).

Przy włączonych kontach użytkowników ustaw dodatkowo:
```env
AUTH_TOKEN_SECRET=dlugi-losowy-sekret
AUTH_TOKEN_TTL_SECONDS=2592000
PASSWORD_RESET_TOKEN_TTL_MS=3600000
USERS_COLLECTION=users
USERS_COLLECTION_TEST=users_test
```

## 🏃 Uruchomienie

### Development (frontend + backend)
```bash
npm run dev
```
Otwórz `http://localhost:5173` w przeglądarce.

### Produkcyjny build frontendu
```bash
npm run build
# Wynikowe pliki: client/dist
```

### Uruchomienie backendu lokalnie
```bash
npm run start --prefix server
```

## ⚙️ Konfiguracja

### Frontend - API Configuration

Frontend komunikuje się z backendem przy użyciu zmiennych środowiskowych. Konfiguracja API:

1. **Development (localhost)**
   ```bash
   # Automatycznie proxy do http://localhost:3000 przez Vite
   # (skonfigurowane w client/vite.config.ts)
   ```

2. **Production**
   ```bash
   # Stwórz plik client/.env.local
   VITE_API_BASE_URL=https://twoj-backend.com
   ```

3. **Szablon konfiguracji**
   ```bash
   # Dostępny w:
  cp client/.env.local.example client/.env.local
   ```

Jeśli `VITE_API_BASE_URL` nie jest ustawiony, frontend automatycznie:
- Na produkcji: wykryje `galaretkarnia.pl` i użyje `https://galaretkarnia.onrender.com`
- W dev: będzie używać Local API (proxy Vite)

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

#### Opcja 2: MongoDB Atlas (chmura) - rekomendowane dla produkcji
```bash
# Wejdź na https://www.mongodb.com/cloud/atlas
# Utwórz darmowe konto
# Skopiuj connection string
# W .env ustaw:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/galaretkarnia?retryWrites=true&w=majority
```

### Email (Resend)

Backend wysyła e-mail z powiadomieniem o każdym nowym zamówieniu.

**📧 [Szczegółowa instrukcja konfiguracji e-mail →](EMAIL-SETUP.md)**

Szybka konfiguracja:
1. W `server/.env` ustaw klucz Resend i adres odbioru zamówień
```env
RESEND_API_KEY=re_twoj_klucz_api
ORDER_EMAIL=kontakt@galaretkarnia.pl
RESEND_FROM_EMAIL=noreply@twoja-domena.pl
```

2. Opcjonalnie dla testów live ustaw oddzielny adres:
```env
ORDER_EMAIL_TEST=testy@twoja-domena.pl
```

**Uwaga**: Zamówienia są zapisywane w MongoDB niezależnie od konfiguracji email!

## 🧩 Skrypty npm (root)

Najczęściej używane skrypty w katalogu głównym:

- `npm run dev` - frontend + backend lokalnie
- `npm run dev:test` - frontend + backend w trybie testowym (`NODE_ENV=test` po stronie backendu)
- `npm run build` - build frontendu (`client/dist`)
- `npm run start` - build frontendu + start backendu
- `npm run test:e2e:smoke` - szybkie testy bez efektów ubocznych
- `npm run test:e2e:all` - pełny profil domyślnych testów E2E (bez live checkout)
- `npm run test:e2e:live` - realny checkout E2E (tworzy prawdziwe zamówienia)
- `npm run test:prod:smoke` - smoke test przeciwko produkcji
- `npm run ops:local:check` - przegląd lokalnego środowiska i gałęzi
- `npm run ops:local:cleanup` - usuwanie lokalnych gałęzi już scalonych

## 🧪 Testy E2E

Projekt ma dwa profile testów Playwright:

1. `smoke` - szybkie testy bez efektów ubocznych (bez tworzenia realnych zamówień):
```bash
npm run test:e2e:smoke
```

`npm run test:e2e:all` używa domyślnego profilu E2E i celowo pomija test live checkout.

2. `live` - testy realnego checkoutu (tworzą prawdziwe zamówienia):
```bash
npm run test:e2e:live
```
Konfiguracja live wymusza `workers=1` i uruchamia tylko `checkout-live.spec.ts`, aby uniknąć równoległego tworzenia wielu realnych zamówień.

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
3. Testowe zamówienia mają automatyczne czyszczenie przez TTL (`TEST_ORDER_TTL_DAYS`).

Konfiguracja znajduje się w:

1. `server/.env.example`
2. `server/server.mjs`
3. `playwright.live.config.ts`

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

## 🔌 Endpointy API

**GET `/api/payment-config`** - Konfiguracja płatności dla frontendu

### Zamówienia

**POST `/api/orders`** - Złóż nowe zamówienie
```json
{
  "phone": "512345678",
  "parcelLockerCode": "WAW01A",
  "paymentMethod": "bank_transfer",
  "notes": "Proszę dostarczyć po 18:00",
  "items": [
    {"name": "Galaretka drobiowa", "qty": 2}
  ]
}
```

`productsTotal`, `deliveryCost` i `total` są wyliczane po stronie backendu na podstawie `items`.

**GET `/api/orders`** - Pobierz wszystkie zamówienia (admin)

**GET `/api/orders/id/:orderId`** - Pobierz szczegóły zamówienia

**PUT `/api/orders/id/:orderId`** - Zmień status zamówienia
```json
{
  "status": "w-realizacji"
}
```

### Konta użytkowników

**POST `/api/auth/register`** - Rejestracja konta
```json
{
  "email": "uzytkownik@example.com",
  "password": "silnehaslo123"
}
```

**POST `/api/auth/login`** - Logowanie
```json
{
  "email": "uzytkownik@example.com",
  "password": "silnehaslo123"
}
```

**GET `/api/auth/me`** - Profil zalogowanego użytkownika (Bearer token)

**GET `/api/auth/orders`** - Historia zamówień przypisanych do zalogowanego konta (Bearer token)

**POST `/api/auth/password-reset/request`** - Prośba o reset hasła
```json
{
  "email": "uzytkownik@example.com"
}
```

**POST `/api/auth/password-reset/confirm`** - Ustaw nowe hasło na podstawie tokenu
```json
{
  "token": "token-z-linku-mailowego",
  "newPassword": "noweSilneHaslo123"
}
```

### Health check

**GET `/api/health`** - Status API i bazy danych
```
{
  "status": "ok",
  "service": "galaretkarnia-api",
  "environment": "production",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptimeSeconds": 123,
  "database": {
    "connected": true,
    "collection": "orders"
  }
}
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
  "userId": "string|null",
  "userEmail": "string|null",
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

Strona jest w pełni responsywna i korzysta z breakpointów:
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
