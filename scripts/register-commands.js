// Rejestruje komendę /test-wsparcie na Twoim serwerze (uruchom raz lokalnie).
// Użycie: npm run register   (czyta zmienne z pliku .env)
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('Uzupełnij DISCORD_TOKEN, CLIENT_ID i GUILD_ID w .env');
  process.exit(1);
}

const commands = [
  {
    name: 'test-wsparcie',
    description: 'Wysyła testowe powiadomienie o wsparciu',
    default_member_permissions: '0', // domyślnie tylko admini
    options: [
      { type: 3, name: 'imie', description: 'Imię wspierającego' },
      { type: 10, name: 'kwota', description: 'Kwota' },
      { type: 3, name: 'wiadomosc', description: 'Dedykacja' },
    ],
  },
];

const res = await fetch(
  `https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bot ${DISCORD_TOKEN}` },
    body: JSON.stringify(commands),
  }
);

if (!res.ok) {
  console.error(`Błąd ${res.status}:`, await res.text());
  process.exit(1);
}
console.log('Komendy zarejestrowane.');
