# ✅ Checklist produkcyjny Galaretkarnia

## 1) Pre-release (na `develop`)
- [ ] `git status` czysty (brak lokalnych zmian)
- [ ] `develop` zsynchronizowany z `origin/develop`
- [ ] `npm run test:e2e:smoke` przechodzi lokalnie
- [ ] `npm run test:prod:smoke` przechodzi przeciwko produkcji
- [ ] Backend health: `GET https://galaretkarnia.onrender.com/api/health` zwraca `status=ok` i `database.connected=true`

## 2) Konfiguracja i bezpieczeństwo
- [ ] Wszystkie zmienne środowiskowe poprawnie ustawione (Render, Vercel)
- [ ] Klucze i sekrety nie występują w repozytorium
- [ ] `MONGODB_URI`, `RESEND_API_KEY`, `ORDER_EMAIL`, `RESEND_FROM_EMAIL` ustawione dla produkcji
- [ ] (Opcjonalnie dla testów live) `ORDER_EMAIL_TEST` ustawiony na osobny adres
- [ ] Brak podatności o poziomie `high/critical`:
	- [ ] root: `npm audit --audit-level=high`
	- [ ] client: `npm audit --prefix client --audit-level=high`
	- [ ] server: `npm audit --prefix server --audit-level=high`

## 3) Release (`main`)
- [ ] Merge `develop -> main` wykonany (merge commit lub fast-forward zgodnie z polityką repo)
- [ ] Push na `origin/main` wykonany
- [ ] Render rozpoczął deployment backendu
- [ ] Vercel ma poprawny build frontendu i zielony status deployu
- [ ] Vercel używa aktualnej konfiguracji:
	- [ ] `installCommand = npm install --prefix client`
	- [ ] `buildCommand = npm run build --prefix client`
	- [ ] `outputDirectory = client/dist`
- [ ] Workflow `Production Smoke` uruchomił się po pushu na `main`

## 4) Post-release (weryfikacja)
- [ ] `npm run test:prod:smoke` nadal przechodzi po deployu
- [ ] Walidacja API (`POST /api/orders`) zwraca poprawne błędy dla niepoprawnych danych:
	- [ ] pusty `items` -> `400`
	- [ ] niepoprawny `parcelLockerCode` -> `400`
	- [ ] niepoprawny `phone` -> `400`
- [ ] Legal pages i checkout działają poprawnie na produkcji
- [ ] Brak błędów krytycznych w logach Render

## 5) Monitoring i operacje
- [ ] Workflow `Production Health Monitor` działa cyklicznie (co 15 min)
- [ ] Ostatnie uruchomienia monitoringu nie mają błędów
- [ ] Lokalny housekeeping wykonany (`npm run ops:local:check`)
- [ ] Niepotrzebne lokalne gałęzie usunięte (`npm run ops:local:cleanup`)

---

Ta lista zakłada workflow: codzienna praca na `develop`, release wyłącznie przez `main`.
