/**
 * Petit client MailHog pour les tests e2e : on lit la boîte de réception réelle
 * alimentée par la chaîne register → RabbitMQ → notifier-service → SMTP (MailHog).
 * Aucune dépendance : `fetch` global (Node 18+).
 */

interface MailhogSearchResponse {
  items?: Array<{
    Content?: { Body?: string };
  }>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Décode le quoted-printable (MailHog stocke le corps brut) puis extrait le
 * token du lien `/auth/verify-email?token=...`.
 */
function extractVerificationToken(rawBody: string): string | null {
  const decoded = rawBody
    .replace(/=\r?\n/g, '') // soft line breaks
    .replace(/=3D/gi, '='); // '=' encodé
  const match = decoded.match(/verify-email\?token=([A-Fa-f0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Attend qu'un mail de vérification arrive pour `email` et renvoie son token.
 * Lève une erreur explicite si rien n'arrive dans le délai imparti.
 */
export async function waitForVerificationToken(
  mailhogUrl: string,
  email: string,
  timeoutMs = 30_000
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  const url = `${mailhogUrl}/api/v2/search?kind=to&query=${encodeURIComponent(email)}`;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as MailhogSearchResponse;
        for (const item of data.items ?? []) {
          const token = extractVerificationToken(item.Content?.Body ?? '');
          if (token) return token;
        }
      }
    } catch {
      // MailHog pas encore joignable : on réessaie.
    }
    await sleep(1_000);
  }

  throw new Error(
    `Aucun mail de vérification reçu pour ${email} dans MailHog (${mailhogUrl}) après ${timeoutMs} ms`
  );
}
