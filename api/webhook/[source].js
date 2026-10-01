// POST /api/webhook/<źródło>  np. /api/webhook/generic, /api/webhook/buycoffee
import crypto from 'node:crypto';
import sources from '../../lib/sources.js';
import { announceSupport } from '../../lib/discord.js';

const json = (data, status = 200) => Response.json(data, { status });

function checkSecret(request) {
  const secret = process.env.WEBHOOK_SECRET || '';
  if (!secret) return true; // brak sekretu = bez weryfikacji (tylko do testów!)
  const url = new URL(request.url);
  const given = request.headers.get('x-webhook-secret') || url.searchParams.get('secret') || '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parseBody(raw, contentType = '') {
  if (!raw) return {};
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  return JSON.parse(raw);
}

export async function POST(request) {
  const sourceName = new URL(request.url).pathname.split('/').filter(Boolean).pop();
  const handler = sources[sourceName];
  if (!handler) return json({ error: 'Nieznane źródło' }, 404);

  const raw = await request.text();

  // Źródło może mieć własną weryfikację (np. podpis HMAC); inaczej wspólny sekret
  const verified = handler.verify ? handler.verify(request, raw) : checkSecret(request);
  if (!verified) return json({ error: 'Nieautoryzowane' }, 401);

  let body;
  try {
    body = parseBody(raw, request.headers.get('content-type') || '');
  } catch {
    return json({ error: 'Nieprawidłowe dane' }, 400);
  }

  try {
    const support = handler.parse(body);
    if (!support) return json({ ok: true, ignored: true });

    await announceSupport({ ...support, source: sourceName });
    return json({ ok: true });
  } catch (err) {
    console.error('Błąd obsługi webhooka:', err);
    return json({ error: 'Błąd serwera' }, 500);
  }
}

export function GET() {
  return json({ ok: true, info: 'Wyślij POST z danymi wsparcia' });
}
