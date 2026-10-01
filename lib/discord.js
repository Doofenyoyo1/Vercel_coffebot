// Wysyłanie powiadomień na Discord bez stałego połączenia.
// Dwie metody (wystarczy jedna):
//  A) DISCORD_WEBHOOK_URL – najprostsza, webhook kanału (bez bota)
//  B) DISCORD_TOKEN + CHANNEL_ID – przez bota (REST API)

const SUPPORT_URL = process.env.SUPPORT_URL || 'https://buycoffee.to/mt2009plus';

export function buildEmbed(support) {
  const amount = support.amount
    ? ` za **${support.amount} ${support.currency || 'zł'}**`
    : '';

  const embed = {
    color: 0xc8763b,
    title: '☕ Nowe wsparcie!',
    url: SUPPORT_URL,
    description: `**${support.name || 'Anonim'}** postawił(a) kawę${amount}!`,
    timestamp: new Date(support.date || Date.now()).toISOString(),
    footer: { text: `Źródło: ${support.source}` },
  };

  if (support.message) {
    embed.fields = [{ name: 'Wiadomość', value: String(support.message).slice(0, 1024) }];
  }
  return embed;
}

export async function announceSupport(support) {
  const { DISCORD_WEBHOOK_URL, DISCORD_TOKEN, CHANNEL_ID } = process.env;
  const payload = {
    embeds: [buildEmbed(support)],
    allowed_mentions: { parse: [] }, // nikt nie zostanie oznaczony przez treść dedykacji
  };

  let res;
  if (DISCORD_WEBHOOK_URL) {
    res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else if (DISCORD_TOKEN && CHANNEL_ID) {
    res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${DISCORD_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
  } else {
    throw new Error('Ustaw DISCORD_WEBHOOK_URL albo DISCORD_TOKEN + CHANNEL_ID');
  }

  if (!res.ok) {
    throw new Error(`Discord odpowiedział ${res.status}: ${await res.text()}`);
  }
}
