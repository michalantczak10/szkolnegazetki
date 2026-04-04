# ✅ Checklist produkcyjny Galaretkarnia

## 1) Pre-release (na `develop`)
- [ ] `git status` czysty (brak lokalnych zmian)
- [ ] `develop` zsynchronizowany z `origin/develop`
- [ ] `npm run test:e2e:smoke` przechodzi lokalnie
- [ ] `npm run test:prod:smoke` przechodzi przeciwko produkcji
- [ ] Backend health: `GET /api/health` zwraca `status=ok` i `database.connected=true`

## 2) Konfiguracja i bezpieczeństwo
- [ ] Wszystkie zmienne środowiskowe poprawnie ustawione (Render, Vercel)
- [ ] Klucze i sekrety nie występują w repozytorium
- [ ] `MONGODB_URI`, `RESEND_API_KEY`, `ORDER_EMAIL`, `RESEND_FROM_EMAIL` ustawione dla produkcji
- [ ] Zależności są aktualne i bez krytycznych podatności

## 3) Release (`main`)
- [ ] Merge `develop -> main` wykonany
- [ ] Push na `origin/main` wykonany
- [ ] Render rozpoczął deployment backendu
- [ ] Vercel ma poprawny build frontendu
- [ ] Workflow `Production Smoke` uruchomił się po pushu na `main`

## 4) Post-release (weryfikacja)
- [ ] `npm run test:prod:smoke` nadal przechodzi po deployu
- [ ] `POST /api/orders` zwraca poprawne błędy walidacji dla niepoprawnych danych
- [ ] Legal pages i checkout działają poprawnie na produkcji
- [ ] Brak błędów krytycznych w logach Render

## 5) Monitoring i operacje
- [ ] Workflow `Production Health Monitor` działa cyklicznie (co 15 min)
- [ ] Alert issue tworzy się automatycznie przy awarii health-check
- [ ] Lokalny housekeeping wykonany (`npm run ops:local:check`)
- [ ] Niepotrzebne lokalne gałęzie usunięte (`npm run ops:local:cleanup`)

---

Ta lista zakłada workflow: codzienna praca na `develop`, release wyłącznie przez `main`.
