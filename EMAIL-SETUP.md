# 📧 Konfiguracja Email - Resend

## Dlaczego potrzebujesz emaili?

Gdy klient złoży zamówienie, system:
1. ✅ Zapisuje zamówienie do bazy MongoDB
2. ✅ Wyświetla klientowi ID zamówienia
3. 📧 **Wysyła Ci email z pełnymi danymi zamówienia**

---

## ⚙️ Konfiguracja Resend

1. Wejdź na: https://resend.com
2. Załóż konto / zaloguj się
3. Przejdź do **API Keys**
4. Kliknij **Create API Key**
5. Skopiuj klucz (zaczyna się od `re_...`)

## 🔐 Ustawienia w `.env`

W `server/.env` ustaw:
```env
RESEND_API_KEY=re_twoj_klucz_api
ORDER_EMAIL=kontakt@galaretkarnia.pl
RESEND_FROM_EMAIL=noreply@galaretkarnia.onresend.com
```

`ORDER_EMAIL` to adres, na który przychodzą powiadomienia o nowych zamówieniach.

---

## ✅ Testuj konfigurację

1. **Zrestartuj backend**:
   ```bash
   # Zatrzymaj poprzedni proces (Ctrl+C w terminalu backendu)
   cd server
   node server.mjs
   ```

2. **Powinien pojawić się komunikat**:
   ```
   ✅ Resend API Key configured
   ```

3. **Wyślij testowe zamówienie** ze strony

4. **Sprawdź skrzynkę odbiorczą** - powinien być email z zamówieniem!

---

## ❌ Troubleshooting

### Błąd: "Missing API key"
- Sprawdź czy `RESEND_API_KEY` jest ustawione
- Upewnij się, że klucz zaczyna się od `re_`

### Email nie przychodzi
- Sprawdź folder SPAM/Junk
- Sprawdź czy backend wyświetlił: `✅ Order email sent for ID: ...`
- Sprawdź logi backendu czy są błędy

---

## 🔒 Bezpieczeństwo

⚠️ **NIGDY** nie commituj pliku `.env` do GitHuba!

Plik `.gitignore` powinien zawierać:
```
server/.env
.env
```

---

## 📧 Przykładowy email zamówienia

Po konfiguracji dostaniesz emaile w formacie:

```
📦 Nowe zamówienie

ID Zamówienia: 69a4b0b698a4d919968eadce

Pozycje:
- Dzika Świnia: 2 słoik(ów) × 22 zł = 44 zł
- Prosiaczek: 1 słoik(ów) × 19 zł = 19 zł

📌 Do zapłaty: 63 zł

Dane klienta:
👤 Imię i nazwisko: Michał Antczak
📞 Telefon: +48794535366
📍 Adres dostawy: Eugeniusza Płoskiego 1/1 m. 10
💬 Uwagi: Brak

⏰ Zamówienie przyjęte: 01.03.2026, 22:33:42
Status: NOWE (oczekuje na potwierdzenie)
```

---

Gotowe! Po skonfigurowaniu emaile będą przychodzić automatycznie przy każdym zamówieniu. 🎉
