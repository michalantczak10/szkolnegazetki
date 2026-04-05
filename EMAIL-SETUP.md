# Konfiguracja email (Resend)

## Co robi backend

Po zlozeniu zamowienia backend:

1. zapisuje zamowienie do MongoDB
2. zwraca klientowi numer zamowienia
3. probuje wyslac email z detalami zamowienia

Wysylka email nie blokuje zapisu zamowienia. Jezeli Resend ma blad, zamowienie nadal jest w bazie.

## Wymagane zmienne srodowiskowe

W Render ustaw:

- RESEND_API_KEY
- RESEND_FROM_EMAIL
- ORDER_EMAIL

Opcjonalnie dla testow live:

- ORDER_EMAIL_TEST

Przyklad:

RESEND_API_KEY=re_twoj_klucz_api
RESEND_FROM_EMAIL=noreply@galaretkarnia.onresend.com
ORDER_EMAIL=kontakt@galaretkarnia.pl

Uwagi:

- konfiguracja email dotyczy backendu, wiec te zmienne ustawiasz w Render, nie w Vercel
- jezeli ORDER_EMAIL nie jest ustawiony, backend uzyje fallbacku `kontakt@galaretkarnia.pl`
- jezeli RESEND_FROM_EMAIL nie jest ustawiony, backend uzyje fallbacku `noreply@galaretkarnia.onresend.com`

Brak konfiguracji Resend:

- jezeli RESEND_API_KEY nie jest ustawiony, backend pominie wysylke maila
- zamowienie nadal zapisze sie do MongoDB
- w logach pojawi sie ostrzezenie, ze Resend nie jest skonfigurowany

## Jak przetestowac

1. sprawdz logi backendu na Render
2. wykonaj testowe zamowienie przez frontend albo przez `POST /api/orders`
3. potwierdz, ze email dotarl na ORDER_EMAIL
4. jezeli uzywasz testow live, sprawdz czy testowe wiadomosci trafiaja na ORDER_EMAIL_TEST

W logach backendu szukaj komunikatow:

- EMAIL accepted by Resend
- EMAIL rejected by Resend
- EMAIL send request failed
- Pominięto wysyłkę maila — Resend nie jest skonfigurowany

Minimalny scenariusz kontrolny:

1. ustaw `RESEND_API_KEY`, `RESEND_FROM_EMAIL` i `ORDER_EMAIL` w Render
2. wyslij jedno poprawne zamowienie testowe
3. sprawdz, czy zamowienie zapisalo sie w MongoDB
4. sprawdz, czy w logach jest `EMAIL accepted by Resend`
5. sprawdz, czy email dotarl na skrzynke odbiorcza

## Najczestsze problemy

1. Brak maili

- zly RESEND_API_KEY
- niepoprawny RESEND_FROM_EMAIL
- wiadomosci trafiaja do spam

2. Mail nie wychodzi, ale zamowienie jest zapisane

To oczekiwane zachowanie. System nie traci zamowienia przez problem z email.

Jesli w logach widzisz komunikat o pominieciu wysylki, to znaczy, ze Resend nie jest skonfigurowany, a nie ze wysylka zostala odrzucona.

3. Rozdzielenie produkcji i testow

Jesli uzywasz testow live, ustaw ORDER_EMAIL_TEST, aby testowe zamowienia nie trafialy na glowna skrzynke.

## Bezpieczenstwo

Nie commituj plikow env do repo. Sekrety trzymaj w zmiennych srodowiskowych backendu w Render.
