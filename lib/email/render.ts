import type { EmailBlock } from "@/types/email";

// Rendu e-mail production : typographie du site (Orbitron pour les titres,
// Space Grotesk pour le corps) auto-hébergée via @font-face, tables 600px,
// styles 100% inline, préheader caché, padding des boutons sur le <td>
// (Outlook ignore le padding des <a>), fix DPI Outlook, media query mobile.
//
// Les @font-face ne sont chargées que par les clients qui les supportent
// (Apple Mail, iOS Mail ≈ moitié des ouvertures) — les autres retombent sur
// la pile système. Fonction pure — serveur (envoi) ET client (preview iframe).

const BLUE = "#2233f0";
const BLACK = "#0a0a0a";
const WIDTH = 600;

const SYSTEM_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
// Mêmes familles que le site : --font-heading / --font-sans (globals.css)
const FONT_HEADING = `'Orbitron', ${SYSTEM_STACK}`;
const FONT_BODY = `'Space Grotesk', ${SYSTEM_STACK}`;

export type RenderOptions = {
  siteUrl: string;
  siteName: string;
  preheader?: string;
  // URL de désinscription propre au destinataire. Pour la preview admin,
  // laisser vide — un lien factice est affiché.
  unsubscribeUrl?: string;
};

// Polices variables auto-hébergées (public/fonts/email) — un seul woff2 par
// famille couvre tous les poids. Réutilisé par la page de désinscription.
export function fontFaceCss(siteUrl: string): string {
  return `
    @font-face {
      font-family: 'Orbitron';
      font-style: normal;
      font-weight: 400 900;
      font-display: swap;
      src: url('${siteUrl}/fonts/email/orbitron.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Space Grotesk';
      font-style: normal;
      font-weight: 300 700;
      font-display: swap;
      src: url('${siteUrl}/fonts/email/space-grotesk.woff2') format('woff2');
    }`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

// Mini-markdown inline : **gras**, *italique*, [label](https://url).
// Échappe d'abord tout le HTML, puis ré-injecte les balises autorisées.
export function renderInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    `<a href="$2" style="color: ${BLUE}; text-decoration: underline;">$1</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/\n/g, "<br />");
  return out;
}

// class="px" : padding réduit sur mobile via la media query du <head>
function row(inner: string, padding = "0 40px"): string {
  return `<tr><td class="px" style="padding: ${padding};">${inner}</td></tr>`;
}

function renderBlock(block: EmailBlock, opts: RenderOptions): string {
  switch (block.type) {
    case "heading":
      return row(
        `<h2 style="margin: 28px 0 8px; font-family: ${FONT_HEADING}; font-size: 22px; line-height: 1.3; mso-line-height-rule: exactly; font-weight: 700; letter-spacing: -0.01em; color: ${BLACK};">${escapeHtml(block.text)}</h2>`
      );

    case "paragraph":
      return row(
        `<p style="margin: 12px 0; font-family: ${FONT_BODY}; font-size: 16px; line-height: 1.65; mso-line-height-rule: exactly; color: #404040;">${renderInline(block.text)}</p>`
      );

    case "image": {
      const img = `<img src="${escapeAttr(block.url)}" alt="${escapeAttr(block.alt)}" width="${WIDTH - 80}" border="0" style="display: block; width: 100%; max-width: ${WIDTH - 80}px; height: auto; border: 0; border-radius: 12px;" />`;
      const inner = block.href
        ? `<a href="${escapeAttr(block.href)}" target="_blank" style="text-decoration: none;">${img}</a>`
        : img;
      return row(`<div style="margin: 16px 0;">${inner}</div>`);
    }

    case "button":
      // Padding sur le <td> : Outlook ignore le padding des <a>
      return row(
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px auto;">
          <tr>
            <td align="center" bgcolor="${BLUE}" style="border-radius: 999px; padding: 14px 32px;">
              <a href="${escapeAttr(block.url)}" target="_blank" style="display: inline-block; font-family: ${FONT_BODY}; font-size: 15px; font-weight: 700; line-height: 1; color: #ffffff; text-decoration: none;">${escapeHtml(block.label)}</a>
            </td>
          </tr>
        </table>`
      );

    case "divider":
      return row(
        `<hr style="margin: 28px 0; border: 0; border-top: 1px solid #e8e8e8;" />`
      );

    case "article": {
      const url = `${opts.siteUrl}/${block.slug}`;
      const color = block.categoryColor || BLUE;
      const cover = block.coverImageUrl
        ? `<tr>
            <td>
              <a href="${escapeAttr(url)}" target="_blank" style="text-decoration: none;">
                <img src="${escapeAttr(block.coverImageUrl)}" alt="${escapeAttr(block.coverImageAlt ?? block.title)}" width="${WIDTH - 82}" border="0" style="display: block; width: 100%; max-width: ${WIDTH - 82}px; height: auto; border: 0; border-radius: 12px 12px 0 0;" />
              </a>
            </td>
          </tr>`
        : "";
      const meta = [
        block.categoryName
          ? `<span style="font-family: ${FONT_BODY}; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${escapeAttr(color)};">${escapeHtml(block.categoryName)}</span>`
          : "",
        block.readingTimeMin
          ? `<span style="font-family: ${FONT_BODY}; font-size: 12px; color: #a3a3a3;">&nbsp;&nbsp;·&nbsp;&nbsp;${block.readingTimeMin} min de lecture</span>`
          : "",
      ].join("");

      return row(
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; border: 1px solid #ececec; border-radius: 12px; border-collapse: separate; overflow: hidden;">
          ${cover}
          <tr>
            <td style="padding: 20px 24px 22px;">
              ${meta ? `<p style="margin: 0 0 8px;">${meta}</p>` : ""}
              <a href="${escapeAttr(url)}" target="_blank" style="text-decoration: none;">
                <h3 style="margin: 0 0 8px; font-family: ${FONT_HEADING}; font-size: 18px; line-height: 1.35; mso-line-height-rule: exactly; font-weight: 700; letter-spacing: -0.01em; color: ${BLACK};">${escapeHtml(block.title)}</h3>
              </a>
              <p style="margin: 0 0 14px; font-family: ${FONT_BODY}; font-size: 14px; line-height: 1.6; mso-line-height-rule: exactly; color: #6b6b6b;">${escapeHtml(block.summary)}</p>
              <a href="${escapeAttr(url)}" target="_blank" style="font-family: ${FONT_BODY}; font-size: 14px; font-weight: 700; color: ${BLUE}; text-decoration: none;">Lire l&#39;article&nbsp;&rarr;</a>
            </td>
          </tr>
        </table>`
      );
    }
  }
}

export function renderEmailHtml(blocks: EmailBlock[], opts: RenderOptions): string {
  const preheader = opts.preheader
    ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(opts.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : "";

  const unsubscribe = opts.unsubscribeUrl
    ? `<a href="${escapeAttr(opts.unsubscribeUrl)}" target="_blank" style="color: #a3a3a3; text-decoration: underline;">Se d&eacute;sinscrire</a>`
    : `<a href="#" style="color: #a3a3a3; text-decoration: underline;">Se d&eacute;sinscrire</a>`;

  const body = blocks.map((b) => renderBlock(b, opts)).join("\n");

  return `<!DOCTYPE html>
<html lang="fr" dir="ltr" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(opts.siteName)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <!--[if !mso]><!-->
  <style>${fontFaceCss(opts.siteUrl)}
  </style>
  <!--<![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .container { border-radius: 0 !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .frame { padding: 0 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; -webkit-text-size-adjust: 100%; text-size-adjust: 100%;">
  ${preheader}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f5f5f5">
    <tr>
      <td align="center" class="frame" style="padding: 32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${WIDTH}" bgcolor="#ffffff" class="container" style="width: 100%; max-width: ${WIDTH}px; background-color: #ffffff; border-radius: 16px; border-collapse: separate; overflow: hidden;">

          <!-- Header — wordmark Orbitron + point bleu, comme la nav du site -->
          <tr>
            <td bgcolor="${BLUE}" class="px" style="padding: 24px 40px;">
              <a href="${escapeAttr(opts.siteUrl)}" target="_blank" style="font-family: ${FONT_HEADING}; font-size: 16px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; color: #ffffff; text-decoration: none;">${escapeHtml(opts.siteName)}&nbsp;<span style="color: #ffffff;">&bull;</span></a>
            </td>
          </tr>

          <!-- Content -->
          ${body}

          <!-- Spacer -->
          <tr><td style="padding: 16px;"></td></tr>
        </table>

        <!-- Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${WIDTH}" style="width: 100%; max-width: ${WIDTH}px;">
          <tr>
            <td align="center" class="px" style="padding: 24px 40px;">
              <p style="margin: 0 0 6px; font-family: ${FONT_BODY}; font-size: 12px; line-height: 1.6; color: #a3a3a3;">
                Vous recevez cet e-mail car vous &ecirc;tes inscrit&middot;e &agrave; la newsletter ${escapeHtml(opts.siteName)}.
              </p>
              <p style="margin: 0; font-family: ${FONT_BODY}; font-size: 12px; color: #a3a3a3;">
                ${unsubscribe}&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${escapeAttr(opts.siteUrl)}" target="_blank" style="color: #a3a3a3; text-decoration: underline;">${escapeHtml(opts.siteUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Version texte brut — améliore la délivrabilité (les filtres spam se méfient
// des e-mails HTML sans alternative texte).
export function renderEmailText(blocks: EmailBlock[], opts: RenderOptions): string {
  const lines: string[] = [opts.siteName.toUpperCase(), ""];
  for (const b of blocks) {
    switch (b.type) {
      case "heading":
        lines.push(b.text.toUpperCase(), "");
        break;
      case "paragraph":
        lines.push(b.text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)"), "");
        break;
      case "image":
        if (b.href) lines.push(`[Image] ${b.href}`, "");
        break;
      case "button":
        lines.push(`${b.label} : ${b.url}`, "");
        break;
      case "divider":
        lines.push("———", "");
        break;
      case "article":
        lines.push(`${b.title}`, b.summary, `Lire : ${opts.siteUrl}/${b.slug}`, "");
        break;
    }
  }
  if (opts.unsubscribeUrl) {
    lines.push("", `Se désinscrire : ${opts.unsubscribeUrl}`);
  }
  return lines.join("\n");
}
