import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { fontFaceCss } from "@/lib/email/render";
import { SITE_NAME, SITE_URL } from "@/lib/config";

// Désinscription en un clic depuis le lien e-mail (token unique par abonné).
// GET = clic humain, POST = "List-Unsubscribe-Post: One-Click" (Gmail/Yahoo).

const TokenSchema = z.string().uuid();

function page(title: string, message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${title} — ${SITE_NAME}</title>
  <style>${fontFaceCss(SITE_URL)}
    body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .brand, h1 { font-family: 'Orbitron', -apple-system, 'Segoe UI', Arial, sans-serif; }
  </style>
</head>
<body style="margin:0; padding:0; background:#f5f5f5;">
  <div style="max-width:480px; margin:80px auto; padding:0 24px; text-align:center;">
    <p class="brand" style="font-size:14px; font-weight:900; letter-spacing:0.16em; text-transform:uppercase; color:#2233f0;">${SITE_NAME}&nbsp;&bull;</p>
    <h1 style="font-size:23px; font-weight:700; letter-spacing:-0.01em; color:#0a0a0a; margin:24px 0 12px;">${title}</h1>
    <p style="font-size:15px; line-height:1.6; color:#6b6b6b; margin:0 0 28px;">${message}</p>
    <a href="${SITE_URL}" style="display:inline-block; padding:12px 28px; border-radius:999px; background:#2233f0; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none;">Retour au site</a>
  </div>
</body>
</html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function unsubscribe(token: string | null): Promise<NextResponse> {
  const parsed = TokenSchema.safeParse(token);
  if (!parsed.success) {
    return page("Lien invalide", "Ce lien de désinscription est invalide ou expiré.");
  }

  const { data, error } = await getAdminClient()
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", parsed.data)
    .is("unsubscribed_at", null)
    .select("id");

  if (error) {
    return page("Une erreur est survenue", "Réessayez dans quelques instants.");
  }

  // Déjà désinscrit ou token inconnu → même message (pas d'oracle sur les tokens)
  if (!data || data.length === 0) {
    return page("C'est noté", "Cette adresse ne recevra plus la newsletter.");
  }

  return page("Désinscription confirmée", "Vous ne recevrez plus la newsletter. Vous pouvez vous réinscrire à tout moment depuis le site.");
}

export async function GET(req: NextRequest) {
  return unsubscribe(req.nextUrl.searchParams.get("token"));
}

export async function POST(req: NextRequest) {
  return unsubscribe(req.nextUrl.searchParams.get("token"));
}
