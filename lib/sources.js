// Każde źródło webhooków to obiekt z funkcją parse() (i opcjonalnie verify()).
// parse(body) zwraca znormalizowany obiekt:
//   { id, name, amount, currency, message, date }
// albo null, jeśli zdarzenie ma zostać zignorowane.
//
// Żeby dodać nowe źródło: dopisz klucz poniżej, a adres webhooka to
//   https://twoj-projekt.vercel.app/api/webhook/<klucz>

export default {
  // Uniwersalny format – testy, Make, Zapier, Power Automate, Apps Script itp.
  // { "id": "abc123", "name": "Jan", "amount": 14, "currency": "zł", "message": "Dzięki!" }
  generic: {
    parse(body) {
      return {
        id: body.id,
        name: body.name,
        amount: body.amount,
        currency: body.currency,
        message: body.message,
        date: body.date,
      };
    },
  },

  // Miejsce na buycoffee.to – uzupełnij, gdy poznasz format ich danych.
  // Na razie próbuje kilku typowych nazw pól.
  buycoffee: {
    parse(body) {
      const d = body.data || body;
      return {
        id: body.id || body.event_id || d.id,
        name: d.name || d.supporter_name || d.firstName,
        amount: d.amount || d.value,
        currency: d.currency || 'zł',
        message: d.message || d.dedication,
        date: d.date || d.created_at,
      };
    },
    // Jeśli buycoffee.to będzie podpisywać żądania (np. HMAC), dodaj:
    // verify(request, rawBody) { ... return true/false; }
  },
};
