import { exit } from "process";

async function main() {
  const url = process.argv[2];
  if (!url) { console.error("Usage: npx tsx scripts/test-yt.ts <url>"); exit(1); }

  // Normalise Shorts → watch URL so YouTube serves the page correctly
  const watchUrl = url.includes("/shorts/")
    ? url.replace(/\/shorts\/([^?#]+)/, "/watch?v=$1")
    : url;

  console.log("Fetching:", watchUrl);

  const res = await fetch(watchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15000),
  });

  console.log("HTTP", res.status);
  const html = await res.text();

  // eslint-disable-next-line prefer-regex-literals
  const match = html.match(new RegExp("var ytInitialPlayerResponse\\s*=\\s*(\\{.+?\\});\\s*(?:var|<\\/script|window)", "s"));
  if (!match) { console.error("ytInitialPlayerResponse not found in page"); exit(1); }

  const data = JSON.parse(match[1]!) as any;
  const sd = data?.streamingData;
  if (!sd) { console.error("No streamingData in player response"); exit(1); }

  console.log("\n=== formats (video+audio combined) ===");
  for (const f of (sd.formats ?? [])) {
    console.log(`  itag=${f.itag} quality=${f.qualityLabel} mimeType=${f.mimeType} hasUrl=${!!f.url} hasCipher=${!!f.signatureCipher}`);
  }

  console.log("\n=== adaptiveFormats (video or audio only) ===");
  for (const f of (sd.adaptiveFormats ?? [])) {
    const kind = f.mimeType?.startsWith("audio") ? "AUDIO" : "VIDEO";
    console.log(`  ${kind} itag=${f.itag} quality=${f.qualityLabel ?? f.audioQuality} mime=${f.mimeType?.split(";")[0]} hasUrl=${!!f.url} hasCipher=${!!f.signatureCipher}`);
  }
}

main().catch(console.error);
