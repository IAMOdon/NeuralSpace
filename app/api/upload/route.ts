import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function isAllowedImage(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true; // JPEG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true; // PNG
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true; // GIF
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return true; // WebP (RIFF)
  // AVIF / HEIC: ISO BMFF ftyp box at offset 4
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return true;
  return false;
}

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isAllowedImage(buffer)) {
    return NextResponse.json(
      { error: "Format non supporté — JPEG, PNG, GIF, WebP ou AVIF uniquement" },
      { status: 415 }
    );
  }

  const ALLOWED_FOLDERS = new Set([
    "neuralspace/uploads",
    "neuralspace/articles",
    "neuralspace/covers",
    "neuralspace/contributors",
    "neuralspace/hero",
  ]);
  const rawFolder = (formData.get("folder") as string | null) ?? "neuralspace/uploads";
  const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : "neuralspace/uploads";

  const result = await uploadImage(buffer, folder);

  return NextResponse.json({ url: result.url });
}
