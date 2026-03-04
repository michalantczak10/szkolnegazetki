# 📋 Krok-po-kroku: Deployment do Produkcji

## ✅ Krok 1: Konfiguruj Gmail (5 minut)

### 1.1 Wygeneruj Google App Password

1. Wejdź: https://myaccount.google.com/apppasswords
2. Jeśli nie logुjesz, zaloguj się swoim Gmaestem
3. W górnym menu wybierz:
   - **Select the app**: `Mail`
   - **Select the device**: `Windows Computer`
4. Kliknij **"Generate"**
5. Google wyświetli ci 16 znaków (bez spacji): np. `abcd efgh ijkl mnop`
6. **Skopiuj bez spacji**: `abcdefghijklmnop`
7. Zapisz gdzieś na notatkę — będzie Ci potrzebne!

---

## ✅ Krok 2: Deploy Backend na Render.com (15 minut)

### 2.1 Utwórz konto Render

1. Wejdź: https://render.com
2. Kliknij **"Sign up"**
3. Wybierz **"Continue with GitHub"**
4. Zaloguj się GitHub account (ten sam co projekt)
5. Zautoryzuj aplikację
6. Gotowe!

### 2.2 Stwórz Web Service

1. Z dashboardu Render kliknij **"New +"**
2. Wybierz **"Web Service"**
3. Renderuj wyświetli listę repo — wybierz **`galaretkarnia`**
4. Kliknij **"Connect"**

### 2.3 Ustaw konfigurację

Wypełnij formularz:

| Pole | Wartość |
|------|---------|
| **Name** | `galaretkarnia-api` |
| **Environment** | `Node` |
| **Region** | `Frankfurt (Europe)` |
| **Branch** | `main` |
| **Root Directory** | `server` ← **WAŻNE!** |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (darmowy) |

### 2.4 Dodaj zmienne środowiskowe

Kliknij **"Advanced"** (rozwiń)

Dodaj każdą zmienną klikając **"Add Environment Variable"**:

```
EMAIL_USER=twój-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop (skopiowany z kroku 1.6)
ORDER_EMAIL=zamowienia@galaretkarnia.pl
FRONTEND_URL=https://galaretkarnia.pl
NODE_ENV=production
PORT=3001
```

### 2.5 Deploy!

Kliknij **"Create Web Service"**

**Czekaj 3-5 minut.** Render:
1. Pobierze kod
2. Zainstaluje zależności (`npm install`)
3. Uruchomi serwer
4. Wyświetli URL: `https://galaretkarnia-api.onrender.com` (lub bardziej dziwny)

**Zapisz ten URL!** Będzie w kroku 3.

### 2.6 Test backendu

Otwórz w przeglądarce:
```
https://galaretkarnia-api.onrender.com/api/health
```

Powinna być odpowiedź:
```json
{"status":"ok","message":"Galaretkarnia API is running"}
```

✅ **Backend żyje!**

---

## ✅ Krok 3: Deploy Frontend na Vercel (10 minut)

### 3.1 Zainstaluj Vercel CLI

Otwórz terminal i uruchom:
```bash
npm install -g vercel
```

### 3.2 Zaloguj się do Vercel

```bash
vercel login
```

1. Wybierz **"Continue with GitHub"**
2. Zaloguj się
3. Gdy pytanie "Create/link project" — **kliknij "y"**

### 3.3 Przygotuj projekt

Upewnij się że jesteś w katalogu projektu:
```bash
cd "c:\Users\Michał Antczak\OneDrive\Projekty\galaretkarnia.pl"
```

**WAŻNE: Zaktualizuj API_URL jeśli Render dał inny URL!**

1. Otwórz `app.ts` (linia ~166)
2. Zmień:
```typescript
const API_URL = "https://galaretkarnia-api.onrender.com/api/orders";
```
Na URL z kroku 2.5 (jeśli jest inny).

3. Przebuduj:
```bash
npm run build
```

4. Commit i push:
```bash
git add .
git commit -m "Update API URL to production Render instance"
git push origin main
```

### 3.4 Deploy na Vercel

```bash
vercel
```

Odpowiadaj na pytania:

| Pytanie | Odpowiedź |
|---------|-----------|
| **Set up and deploy?** | `y` |
| **Which scope?** | Wybierz Twoje konto |
| **Link to existing project?** | `N` |
| **What's your project's name?** | `galaretkarnia` |
| **In which directory is your code?** | `.` (znaku kropka) |
| **Want to modify vercel.json?** | `Y` |

### 3.5 Weź Vercel URL

Po deployu Vercel poda URL:
```
✓ Deployed to https://galaretkarnia.vercel.app
```

**Zapisz ten URL!** To będzie Twoja strona do czasu podłączenia domeny.

### 3.6 Test frontendu

Otwórz w przeglądarce:
```
https://galaretkarnia.vercel.app
```

Powinna być Twoja sklepowa strona z koszkiem!

✅ **Frontend żyje!**

---

## ✅ Krok 4: Podłącz domenę home.pl → Vercel

### 4.1 Weź DNS records z Vercel

Zamiast kroku 3.5, jeśli nie zapisałeś, uruchom:
```bash
vercel env list
```

I weż z listy **production** Domain.

Albo wejdź do https://vercel.com → Dashboard → Project `galaretkarnia` → Settings → Domains.

Tam będą DNS records do dodania:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com.
```

I:
```
Type: CNAME
Name: www
Value: alias.vercel.app.
```

(dokładne wartości pokaże Vercel)

### 4.2 Ustaw DNS w home.pl

1. Zaloguj się do panelu home.pl: https://panel.home.pl
2. Wejdź w **"Domeny"**
3. Wybierz **`galaretkarnia.pl`**
4. Wejdź w **"Ustawienia DNS"** lub **"Rekordy DNS"**
5. Dodaj CNAME records z kroku 4.1:
   - Usuń stare A rekordy (jeśli są)
   - Dodaj CNAME dla `@` → `cname.vercel-dns.com.`
   - Dodaj CNAME dla `www` → `alias.vercel.app.`
6. Zapisz

### 4.3 Czekaj na propagację

DNS propaguje się **5-30 minut**, czasem do 24 godzin.

Sprawdzaj czy działa:
```bash
nslookup galaretkarnia.pl
```

Gdy pojawi się Vercel IP — gotowe!

### 4.4 Konfiguruj w Vercel

1. Wejdź do https://vercel.com → Dashboard → `galaretkarnia`
2. Kliknij **"Settings"** → **"Domains"**
3. Dodaj: `galaretkarnia.pl`
4. Vercel sprawdzi DNS i pokaże green ✓

✅ **Domena podłączona!**

---

## ✅ Krok 5: Testuj całą aplikację (10 minut)

### 5.1 Wejdź na stronę

Otwórz:
```
https://galaretkarnia.pl
```

(lub jeśli DNS jeszcze się nie propaguje, użyj https://galaretkarnia.vercel.app)

### 5.2 Test zamówienia

1. Dodaj kilka produktów do koszyka
2. Kliknij **"Przejdź do zamówienia"**
3. Wypełnij formularz:
   - **Imię**: `Test User`
   - **Telefon**: `+48 500 600 700`
   - **Adres**: `ul. Testowa 123, 00-001 Warszawa`
4. Kliknij **"Zamawiam"**

### 5.3 Sprawdź odpowiedź

Powinna być:
```
⏳ Wysyłanie zamówienia... (na 2 sekundy)
✅ Zamówienie przyjęte! Skontaktujemy się w ciągu 30 minut.
```

Koszyk powinien się wyczyścić, formularz tez.

### 5.4 Sprawdź email

Login do Gmaila: https://mail.google.com

Powinna być wiadomość z tematu:
```
Nowe zamówienie - Galaretkarnia.pl #1234567890
```

W treści:
- Wszystkie produkty
- Cena całkowita
- Dane klienta (imię, tel, adres)
- Data i godzina

✅ **SUKCES! System działa!**

---

## 🆘 Troubleshooting

### ❌ "Email failed" w konsoli
**Przyczyna**: Złe EMAIL_PASSWORD na Render

**Rozwiązanie:**
1. Wejdź https://myaccount.google.com/apppasswords
2. Wygeneruj NOWY App Password
3. W Render (Settings → Environment) zaktualizuj `EMAIL_PASSWORD`
4. Render automatycznie się zredeployuje

### ❌ "CORS error" w przeglądarce
**Przyczyna**: Frontend i backend nie matchują

**Rozwiązanie:**
1. Sprawdź czy `API_URL` w `app.ts` jest dokładnie taki jak URL Render
2. Sprawdź czy `FRONTEND_URL` na Render to dokładnie `https://galaretkarnia.pl`
3. Rebuild + push:
```bash
npm run build && git add . && git commit -m "Fix CORS" && git push
```

### ❌ "Domena home.pl nie łączy się"
**Przyczyna**: DNS się jeszcze nie propagował

**Rozwiązanie:**
- Czekaj 5-30 minut
- Poczekaj do jutra jeśli trzeba
- Sprawdzaj: https://dnschecker.org/ (wpisz `galaretkarnia.pl`)

### ❌ "Render service is sleeping"
**Przyczyna**: Free tier Render usuwa nieaktywne apki po 15 min

**Rozwiązanie**: Wyślij 1 test-zamówienie co 15 minut, albo upgrade do paid.

---

## 🎉 Gratulacje!

Masz gotowy e-commerce:
- ✅ Strona na Vercel (darmowy hosting)
- ✅ API na Render (darmowy hosting)
- ✅ Domena z home.pl (15-20 zł/mies)
- ✅ Email na Gmaila (darmowy)
- ✅ **TOTAL: 15-20 zł/mies!**

Możesz teraz:
- Promować galaretkarnia.pl
- Zbierać zamówienia
- Wysyłać je do maila
- Rosnąć bez limitów!

💪 **Powodzenia w biznesie!**
