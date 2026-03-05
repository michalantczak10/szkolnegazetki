# 🚀 Deployment Guide - Kompletny Przewodnik

## 📌 Architektura Deployment

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Vercel         │────────>│  Render.com      │────────>│  MongoDB Atlas  │
│  (Frontend)     │  HTTPS  │  (Backend API)   │  HTTPS  │  (Database)     │
│  galaretkarnia  │         │  Node.js + Express         │  Cloud DB       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

---

## 🎯 Krok 1: MongoDB Atlas (Baza danych)

### 1.1 Utwórz darmowy klaster

1. Wejdź na: https://www.mongodb.com/cloud/atlas/register
2. Zaloguj się (Google/GitHub)
3. Utwórz nowy projekt: **"Galaretkarnia"**
4. **Create Deployment** → wybierz **FREE (M0)** 
5. Provider: **AWS** / Region: **Frankfurt (eu-central-1)**
6. Cluster Name: **galaretkarnia**
7. Kliknij **Create Deployment**

### 1.2 Konfiguracja dostępu

1. **Database Access** (lewy menu):
   - Add New Database User
   - Username: `galaretkarnia_admin`
   - Password: **WYGENERUJ** (zapisz gdzieś!)
   - Database User Privileges: **Read and write to any database**
   - Add User

2. **Network Access** (lewy menu):
   - Add IP Address
   - Wybierz: **ALLOW ACCESS FROM ANYWHERE** (0.0.0.0/0)
   - Potwierdź

### 1.3 Pobierz Connection String

1. **Database** → kliknij **Connect** na swoim klastrze
2. Wybierz: **Drivers**
3. Skopiuj **Connection String**:
   ```
   mongodb+srv://galaretkarnia_admin:<password>@galaretkarnia.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Zamień `<password>`** na prawdziwe hasło użytkownika
5. **Dodaj nazwę bazy** przed `?`:
   ```
   mongodb+srv://galaretkarnia_admin:HASLO@galaretkarnia.xxxxx.mongodb.net/galaretkarnia?retryWrites=true&w=majority
   ```

✅ **Zapisz ten string - będzie potrzebny w kroku 2!**

---

## 🖥️ Krok 2: Backend na Render.com

### 2.1 Przygotuj repo

Upewnij się że wszystkie zmiany są na GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push
```

### 2.2 Utwórz Web Service na Render

1. Wejdź na: https://render.com
2. Zaloguj się przez **GitHub**
3. Kliknij **New +** → **Web Service**
4. Wybierz repo: **`galaretkarnia`**
5. Kliknij **Connect**

### 2.3 Konfiguracja Web Service

Wypełnij formularz:

| Pole | Wartość |
|------|---------|
| **Name** | `galaretkarnia-api` |
| **Region** | `Frankfurt (EU Central)` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.mjs` |
| **Plan** | **Free** |

### 2.4 Environment Variables

W sekcji **Environment**, kliknij **Add Environment Variable** i dodaj:

```env
MONGODB_URI=mongodb+srv://galaretkarnia_admin:TWOJE_HASLO@cluster.mongodb.net/galaretkarnia?retryWrites=true&w=majority

EMAIL_USER=twoj-email@gmail.com

EMAIL_PASSWORD=twoje-16-znakowe-app-password

ORDER_EMAIL=zamowienia@galaretkarnia.pl

FRONTEND_URL=https://galaretkarnia.pl

NODE_ENV=production

PORT=10000
```

⚠️ **WAŻNE**: 
- Wstaw prawdziwe dane!
- `MONGODB_URI` = connection string z kroku 1.3
- `EMAIL_USER` + `EMAIL_PASSWORD` = dane z Gmail App Password
- `FRONTEND_URL` = zostaw na razie tak, zaktualizujemy w kroku 3

### 2.5 Deploy!

1. Kliknij **Create Web Service**
2. Render zacznie deployment (2-3 minuty)
3. Poczekaj aż status zmieni się na **Live** ✅

### 2.6 Zapisz URL backendu

Po deploymencie zobaczysz URL:
```
https://galaretkarnia-api.onrender.com
```

✅ **Zapisz ten URL - będzie potrzebny w kroku 3!**

### 2.7 Testuj backend

Otwórz w przeglądarce:
```
https://galaretkarnia-api.onrender.com/api/health
```

Powinieneś zobaczyć:
```json
{"status":"ok","message":"Galaretkarnia API is running"}
```

---

## 🌐 Krok 3: Frontend na Vercel

### 3.1 Zaktualizuj API URL w kodzie

1. Otwórz `app.ts`
2. Znajdź linię z `API_URL`
3. Zmień na URL z Render:
```typescript
const API_URL = "https://galaretkarnia-api.onrender.com/api/orders";
```

4. Skompiluj:
```bash
npm run build
```

5. Commituj:
```bash
git add .
git commit -m "Update API URL for production deployment"
git push
```

### 3.2 Deploy na Vercel

1. Wejdź na: https://vercel.com
2. Zaloguj się przez **GitHub**
3. Kliknij **Add New...** → **Project**
4. Wybierz repo: **`galaretkarnia`**
5. Kliknij **Import**

### 3.3 Konfiguracja projektu

| Pole | Wartość |
|------|---------|
| **Framework Preset** | Other |
| **Root Directory** | `./` (leave as default) |
| **Build Command** | `npm run build` (lub zostaw puste) |
| **Output Directory** | `./` (leave as default) |

### 3.4 Environment Variables (Vercel)

**BRAK** - frontend nie potrzebuje zmiennych środowiskowych!

### 3.5 Deploy!

1. Kliknij **Deploy**
2. Vercel zbuduje i wdroży (1-2 minuty)
3. Po zakończeniu zobaczysz URL:
   ```
   https://galaretkarnia.vercel.app
   ```

### 3.6 Dodaj własną domenę (opcjonalne)

1. W projekcie Vercel: **Settings** → **Domains**
2. Dodaj domenę: `galaretkarnia.pl`
3. Skonfiguruj DNS u rejestratora domeny
4. Poczekaj na weryfikację (do 24h)

---

## 🔧 Krok 4: Finalizacja

### 4.1 Zaktualizuj FRONTEND_URL na Render

1. Wejdź na Render Dashboard
2. Otwórz serwis: **galaretkarnia-api**
3. **Environment** → Znajdź `FRONTEND_URL`
4. Zmień na prawdziwy URL Vercel:
   ```
   https://galaretkarnia.vercel.app
   ```
   (lub Twoja własna domena)
5. **Save Changes**
6. Serwis automatycznie się zrestartuje

### 4.2 Testuj produkcyjną wersję!

1. Otwórz: `https://galaretkarnia.vercel.app`
2. Dodaj produkty do koszyka
3. Wypełnij formularz
4. Wyślij zamówienie
5. Sprawdź czy:
   - ✅ Dostałeś ID zamówienia
   - ✅ Email przyszedł na `ORDER_EMAIL`
   - ✅ Zamówienie jest w MongoDB Atlas

---

## ✅ Checklist Deployment

- [ ] MongoDB Atlas - klaster utworzony
- [ ] MongoDB - connection string skopiowany
- [ ] MongoDB - IP 0.0.0.0/0 dodane do whitelist
- [ ] Gmail - App Password wygenerowany
- [ ] Render - backend wdrożony
- [ ] Render - wszystkie zmienne ENV ustawione
- [ ] Render - status "Live"
- [ ] Render - `/api/health` zwraca OK
- [ ] Vercel - frontend wdrożony
- [ ] Vercel - strona się otwiera
- [ ] Testowe zamówienie - przeszło pomyślnie
- [ ] Email - przyszedł na ORDER_EMAIL
- [ ] MongoDB Atlas - zamówienie widoczne w bazie

---

## 🔄 Aktualizacje w przyszłości

### Jak zaktualizować backend:
```bash
git add .
git commit -m "Update backend"
git push
```
→ Render automatycznie wykryje i wdroży zmiany

### Jak zaktualizować frontend:
```bash
npm run build
git add .
git commit -m "Update frontend"
git push
```
→ Vercel automatycznie wykryje i wdroży zmiany

---

## 🆘 Troubleshooting

### Backend nie działa na Render
- Sprawdź logi: Dashboard → galaretkarnia-api → Logs
- Sprawdź czy MongoDB connection string jest poprawny
- Sprawdź czy wszystkie ENV są ustawione

### Frontend nie łączy się z backend
- Sprawdź czy API_URL w app.ts jest poprawny
- Sprawdź CORS - czy FRONTEND_URL na Render jest poprawny
- Otwórz konsolę przeglądarki (F12) i sprawdź błędy

### Email nie działa
- Sprawdź logi Render
- Sprawdź czy App Password jest poprawny (bez spacji)
- Sprawdź folder SPAM

### MongoDB "IP not whitelisted"
- Dodaj 0.0.0.0/0 w Network Access (Atlas)

---

🎉 **Gratulacje! Twoja aplikacja jest live!**

