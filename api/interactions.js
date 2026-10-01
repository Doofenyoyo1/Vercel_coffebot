// POST /api/interactions – obsługa slash komend przez HTTP (opcjonalne).
// Ustaw ten adres w Discord Developer Portal → General Information →
// "Interactions Endpoint URL": https://twoj-projekt.vercel.app/api/interactions
import crypto from 'node:crypto';
import { announceSupport } from '../lib/discord.js';

const EPHEMERAL = 64;

// Weryfikacja podpisu ed25519 wymagana przez Discord
function verifyDiscordSignature(request, raw) {
  const publicKeyHex = process.env.DISCORD_PUBLIC_KEY;
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  if (!publicKeyHex || !signature || !timestamp) return false;

  try {
    const key = crypto.createPublicKey({
      key: Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'), // nagłówek DER dla ed25519
        Buffer.from(publicKeyHex, 'hex'),
      ]),
      format: 'der',
      type: 'spki',
    });
    return crypto.verify(null, Buffer.from(timestamp + raw), key, Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

const reply = (content) =>
  Response.json({ type: 4, data: { content, flags: EPHEMERAL } });

export async function POST(request) {
  const raw = await request.text();
  if (!verifyDiscordSignature(request, raw)) {
    return new Response('Nieprawidłowy podpis', { status: 401 });
  }

  const interaction = JSON.parse(raw);

  // PING od Discorda przy zapisywaniu adresu w portalu
  if (interaction.type === 1) return Response.json({ type: 1 });

  // Komenda slash
  if (interaction.type === 2 && interaction.data.name === 'test-wsparcie') {
    const opts = Object.fromEntries((interaction.data.options || []).map((o) => [o.name, o.value]));
    const user = interaction.member?.user || interaction.user;

    try {
      await announceSupport({
        source: 'test',
        name: opts.imie || user?.global_name || user?.username,
        amount: opts.kwota ?? 14,
        currency: 'zł',
        message: opts.wiadomosc || 'Testowa kawa ☕',
      });
      return reply('Wysłano testowe powiadomienie.');
    } catch (err) {
      console.error(err);
      return reply(`Błąd: ${err.message}`);
    }
  }

  return reply('Nieznana komenda.');
}
