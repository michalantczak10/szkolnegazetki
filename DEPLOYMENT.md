# 🚀 Deployment Guide - Galaretkarnia.pl

## ✅ Rekomendowany wariant: jeden serwer (Node.js + MongoDB)

Ten wariant upraszcza całość: frontend i API działają na tej samej domenie, więc nie ma problemów z CORS ani z osobnym deployem frontu/backu.

### 1) Wymagania serwera
- VPS z Docker + Docker Compose
- Otwarty port `80` i `443`
- Domena ustawiona na IP serwera (rekord `A`)

### 2) Pliki deploymentu (już w repo)
- `Dockerfile`
- `docker-compose.yml`
- `deploy/Caddyfile`
- `.env.prod.example`

### 3) Start na serwerze
```bash
git clone https://github.com/michalantczak10/galaretkarnia.git
cd galaretkarnia
cp .env.prod.example .env
# uzupełnij SENDGRID_API_KEY i domenę
docker compose --env-file .env up -d --build
```

### 4) Konfiguracja domeny
- DNS: rekord `A` dla `galaretkarnia.pl` na IP VPS
- Caddy sam wystawi HTTPS (Let's Encrypt)

### 5) Mail
- używamy SendGrid API (`SENDGRID_API_KEY`)
- nadawca: `SENDGRID_FROM_EMAIL`
- odbiorca zamówień: `ORDER_EMAIL`

### 6) Aktualizacja aplikacji
```bash
git pull
docker compose --env-file .env up -d --build
```

## Struktura projektu

```
galaretkarnia.pl/
├── frontend (Vercel)
│   ├── index.html
│   ├── app.ts / app.js
│   ├── style.css
│   ├── vercel.json (config)
│   └── package.json
├── server (Render)
│   ├── server.mjs (Express API)
│   ├── package.json
│   └── .env (secret - nie commituj!)
└── .gitignore
```

---

## 1️⃣ Deploy Backend (Render.com)

### Krok 1: Przygotuj repo na GitHub
```bash
git add .
git commit -m "Add Node.js backend for order processing"
git push origin main
```

### Krok 2: Utwórz konto na Render
- Wejdź: https://render.com
- Zaloguj się GitHub account
- Kliknij "New +" → "Web Service"

### Krok 3: Połącz repo
- Wybierz: `michalantczak10/galaretkarnia`
- Ustaw:
  - **Name**: `galaretkarnia-api`
  - **Root Directory**: `server`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`

### Krok 4: Ustaw Environment Variables
Kliknij "Advanced" → dodaj:
```
EMAIL_USER = twój-email@gmail.com
EMAIL_PASSWORD = 16-znakowy-app-password (nie zwykłe hasło!)
ORDER_EMAIL = zamowienia@galaretkarnia.pl
FRONTEND_URL = https://galaretkarnia.pl
NODE_ENV = production
```

**⚠️ Ważne: Wygeneruj Google App Password**
1. Wejdź: https://myaccount.google.com/apppasswords
2. Wybierz: Mail + Windows Computer
3. Skopiuj 16-znakowe hasło (bez spacji)
4. Wklej do Render jako `EMAIL_PASSWORD`

### Krok 5: Deploy
- Kliknij "Create Web Service"
- Czekaj 2-3 minuty
- URL będzie: `https://galaretkarnia-api.onrender.com` (lub inny)

**Zapisz ten URL!** Będzie ci potrzebny do frontendu.

---

## 2️⃣ Deploy Frontend (Vercel)

### Krok 1: Zainstaluj Vercel CLI
```bash
npm install -g vercel
```

### Krok 2: Zaloguj się do Vercel
```bash
vercel login
```
Wybierz "GitHub" i zaloguj

### Krok 3: Deploy
Z katalogu projektu:
```bash
vercel
```

Odpowiadaj na pytania:
- **Project name**: `galaretkarnia`
- **Which scope**: Your account
- **Link to existing project**: No
- **Directory to deploy**: `.` (root)
- **Modify vercel.json**: Yes

### Krok 4: Ustaw Domain
Vercel poda Ci URL:
```
https://galaretkarnia.vercel.app
```

### Krok 5: Podłącz domenę z home.pl
W home.pl:
1. Wejdź do panelu DNS
2. Dodaj rekordy CNAME:
   - `@` → `cname.vercel-dns.com.`
   - `www` → `alias.vercel.app.` (u vercel będzie dokładny URL)
3. Czekaj 5-10 minut na propagację

---

## 3️⃣ Aktualizuj Frontend z correctnym API URL

Jeśli Render dał Ci inny URL, zaktualizuj `app.ts`:

```typescript
const API_URL = "https://twój-render-api-url/api/orders"; // Zmień URL
```

Przebuduj:
```bash
npm run build
git add .
git commit -m "Update API_URL to production Render instance"
git push origin main
```

Vercel automatycznie zrobi redeploy!

---

## 4️⃣ Testowanie

### Test backend
```bash
curl -X POST https://galaretkarnia-api.onrender.com/api/health
```

Powinna być odpowiedź:
```json
{"status":"ok"}
```

### Test zamówienia
Wejdź na https://galaretkarnia.pl, głównie:
1. Dodaj produkty do koszyka
2. Wpisz dane
3. Kliknij "Zamawiam"
4. Powinna być odpowiedź: ✅ "Zamówienie przyjęte!"
5. Email powinien przyjść na `zamowienia@galaretkarnia.pl`

---

## Troubleshooting

**❌ Backend zwraca 500 błąd**
- Sprawdź zmienne środowiskowe na Render
- Upewnij się że GMAIL_PASSWORD to "App Password", nie długie hasło

**❌ Email się nie wysyła**
- Sprawdź `EMAIL_USER` i `EMAIL_PASSWORD` na Render
- Wynegocjuj App Password ponownie https://myaccount.google.com/apppasswords

**❌ CORS error na froncie**
- Sprawdź `FRONTEND_URL` w Render (powinna być dokładna domena)
- Upewnij się że frontend wysyła do correctnego `API_URL`

**❌ Domena home.pl nie łączy się z Vercel**
- Czekaj 24h na propagację DNS
- Sprawdź rekordy DNS w panelu home.pl
- Vercel powinien wyświetlić dokładne instrukcje DNS

---

## Producxing Checklist

- [x] Backend deploymentu na Render
- [x] Frontend deploymentu na Vercel  
- [x] Domena podłączona
- [x] Gmail App Password skonfigurowany
- [x] Email verification (test zamówienia)
- [x] UI feedback widoczne (spinner, success message)
- [x] HTTPS na prod (automatycznie Render + Vercel)

🎉 Gotowe do łapania zamówień!
