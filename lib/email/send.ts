import "server-only";

// Envoi via l'API Resend (https://resend.com) — fetch direct, pas de SDK.
// L'envoi SMTP auto-hébergé est exclu : la délivrabilité (SPF/DKIM/réputation IP)
// impose un fournisseur. Resend reste "managed by us" : audience, contenu et
// historique vivent dans notre Supabase, Resend n'est que le tuyau.

const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";
const RESEND_SEND_URL = "https://api.resend.com/emails";
export const BATCH_SIZE = 100; // limite Resend par appel batch

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl?: string;
};

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

function headersFor(email: OutgoingEmail): Record<string, string> | undefined {
  if (!email.unsubscribeUrl) return undefined;
  return {
    "List-Unsubscribe": `<${email.unsubscribeUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function toPayload(email: OutgoingEmail) {
  return {
    from: process.env.EMAIL_FROM,
    to: [email.to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    headers: headersFor(email),
  };
}

async function post(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

export async function sendOne(email: OutgoingEmail): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error("Envoi non configuré — définir RESEND_API_KEY et EMAIL_FROM.");
  }
  await post(RESEND_SEND_URL, toPayload(email));
}

// Envoie par lots de 100. Retourne le nombre d'e-mails effectivement transmis
// à Resend ; s'arrête à la première erreur de lot (les lots précédents sont partis).
export async function sendBatch(emails: OutgoingEmail[]): Promise<number> {
  if (!isEmailConfigured()) {
    throw new Error("Envoi non configuré — définir RESEND_API_KEY et EMAIL_FROM.");
  }
  let sent = 0;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    await post(RESEND_BATCH_URL, chunk.map(toPayload));
    sent += chunk.length;
  }
  return sent;
}
