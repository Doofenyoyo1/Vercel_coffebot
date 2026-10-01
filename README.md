# coffee-bot (Vercel)

Ogłasza na Discordzie wsparcie (np. z buycoffee.to) otrzymane przez webhooki.
Działa serverless na Vercelu, bez zależności npm.

## Wariant najprostszy (bez bota)
1. Na Discordzie: **Kanał → Edytuj kanał → Integracje → Webhooki → Nowy webhook → Kopiuj URL**
2. Wrzuć projekt na GitHub i zaimportuj go na https://vercel.com/new
3. W Vercel → **Settings → Environment Variables** dodaj:
   - `DISCORD_WEBHOOK_URL` – skopiowany URL
   - `WEBHOOK_SECRET` – długi losowy ciąg
4. Redeploy. Gotowe.

Adres dla źródeł wpłat:
```
https://<twoj-projekt>.vercel.app/api/webhook/generic?secret=<WEBHOOK_SECRET>
```

Test:
```bash
curl -X POST https://<twoj-projekt>.vercel.app/api/webhook/generic \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <WEBHOOK_SECRET>" \
  -d '{"name":"Jan","amount":14,"message":"Dzięki za content!"}'
```

## Dodawanie webhooków
Źródła są w `lib/sources.js`. Każde to funkcja `parse(body)` zwracająca
`{ id, name, amount, currency, message, date }`. Adres: `/api/webhook/<klucz>`.

- `generic` – uniwersalny format (Make, Zapier, Power Automate, Apps Script, testy)
- `buycoffee` – szablon do uzupełnienia, gdy poznasz format buycoffee.to

## Opcjonalnie: bot + komenda /test-wsparcie
1. https://discord.com/developers/applications → **New Application**
2. Skopiuj **Application ID** (`CLIENT_ID`) i **Public Key** (`DISCORD_PUBLIC_KEY`)
3. **Bot → Reset Token** → `DISCORD_TOKEN`
4. **OAuth2 → URL Generator**: `bot` + `applications.commands`, uprawnienia `Send Messages`, `Embed Links` → dodaj bota na serwer
5. Dodaj w Vercel zmienne `DISCORD_TOKEN`, `CHANNEL_ID`, `DISCORD_PUBLIC_KEY` i zrób redeploy
6. W portalu (General Information) ustaw **Interactions Endpoint URL**:
   `https://<twoj-projekt>.vercel.app/api/interactions`
7. Lokalnie: `cp .env.example .env`, uzupełnij `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, potem `npm run register`

## Ograniczenia Vercela
- Bot nie jest „online” (zielona kropka) – to normalne, działa przez HTTP.
- Brak pamięci między wywołaniami, więc nie ma blokady duplikatów. Jeśli źródło
  ponawia wysyłkę, dodaj np. Upstash Redis.
