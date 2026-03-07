# Konfiguracja Stripe - Płatności Online

## 1. Załóż konto Stripe

1. Przejdź na https://stripe.com
2. Kliknij "Sign up" i utwórz konto
3. Wypełnij dane firmy (możesz zacząć w trybie testowym)

## 2. Pobierz klucze API

1. Zaloguj się do Dashboard Stripe: https://dashboard.stripe.com
2. Przejdź do **Developers** → **API keys**
3. Znajdź **Secret key** (zaczyna się od `sk_test_` lub `sk_live_`)
4. Kliknij "Reveal test key" lub "Reveal live key" i skopiuj klucz

⚠️ **UWAGA:** Nigdy nie udostępniaj Secret Key publicznie!

## 3. Dodaj klucz do zmiennych środowiskowych

Otwórz plik `server/.env` i dodaj:

```env
STRIPE_SECRET_KEY=sk_test_twoj_klucz_tutaj
BASE_URL=https://twoja-domena.com
```

**Dla środowiska testowego (development):**
```env
STRIPE_SECRET_KEY=sk_test_...
BASE_URL=http://localhost:5173
```

**Dla środowiska produkcyjnego (Render):**
```env
STRIPE_SECRET_KEY=sk_live_...
BASE_URL=https://twoja-domena.onrender.com
```

## 4. Restart serwera

Po dodaniu klucza zrestartuj serwer backendu:

```bash
cd server
npm run dev
```

W konsoli powinieneś zobaczyć: `✅ Stripe configured`

## 5. Konfiguracja na Render (produkcja)

1. Wejdź na https://dashboard.render.com
2. Wybierz swój serwis backendu
3. Przejdź do **Environment** → **Environment Variables**
4. Dodaj dwie zmienne:
   - `STRIPE_SECRET_KEY` = `sk_live_twoj_klucz`
   - `BASE_URL` = `https://twoja-domena.com`
5. Kliknij "Save Changes" - serwis zrestartuje się automatycznie

## 6. Testowanie

### Tryb testowy (test mode)

W trybie testowym możesz używać testowych kart:

- **Karta poprawna:** `4242 4242 4242 4242`
- **CVV:** dowolne 3 cyfry
- **Data ważności:** dowolna przyszła data
- **Kod pocztowy:** dowolny

Więcej testowych kart: https://stripe.com/docs/testing

### Tryb produkcyjny (live mode)

1. W Dashboard Stripe przełącz się na **Live mode**
2. Wypełnij wszystkie wymagane dane firmy (KYC)
3. Dodaj dane bankowe do wypłat
4. Użyj `sk_live_...` klucza w zmiennych środowiskowych

## 7. Webhook (opcjonalnie - dla zaawansowanych)

Jeśli chcesz automatycznie aktualizować statusy zamówień:

1. W Dashboard Stripe przejdź do **Developers** → **Webhooks**
2. Kliknij "Add endpoint"
3. URL: `https://twoja-domena.com/api/stripe-webhook`
4. Events: wybierz `checkout.session.completed`
5. Skopiuj **Signing secret** (zaczyna się od `whsec_`)
6. Dodaj do `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Prowizje Stripe

- **Karty europejskie:** 1,4% + 1 zł
- **Karty spoza Europy:** 2,9% + 1 zł
- **BLIK:** ~1,4% + 1 zł
- **Przelewy24:** ~1,5%

Szczegóły: https://stripe.com/pl/pricing

## Wsparcie

- Dokumentacja Stripe: https://stripe.com/docs
- Dashboard Stripe: https://dashboard.stripe.com
- Support Stripe: https://support.stripe.com
