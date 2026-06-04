import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Upload (server-side only) ---

export type UploadResult = {
  publicId: string;
  url: string;
  width: number;
  height: number;
};

export async function uploadImage(
  source: string | Buffer,
  folder: string = "neuralspace"
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(
    typeof source === "string" ? source : `data:image/webp;base64,${(source as Buffer).toString("base64")}`,
    {
      folder,
      resource_type: "image",
      format: "webp",
      quality: "auto:best",
    }
  );

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
  };
}

// --- URL helpers (no SDK needed, usable anywhere) ---

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dz7bhmbox";
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;

type TransformOptions = {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "webp" | "auto";
  fit?: "cover" | "contain" | "fill";
};

export function cloudinaryUrl(publicId: string, opts: TransformOptions = {}): string {
  const transforms: string[] = [
    "f_" + (opts.format ?? "auto"),
    "q_" + (opts.quality ?? "auto"),
  ];

  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.height) transforms.push(`h_${opts.height}`);
  if (opts.fit) {
    const cropMap = { cover: "fill", contain: "fit", fill: "scale" } as const;
    transforms.push(`c_${cropMap[opts.fit]}`);
  }

  return `${BASE}/${transforms.join(",")}/${publicId}`;
}

// Preset: article cover (16:9, max 1200px wide)
export function coverUrl(publicId: string): string {
  return cloudinaryUrl(publicId, { width: 1200, height: 675, fit: "cover" });
}

// Preset: Open Graph image (1200x630)
export function ogImageUrl(publicId: string): string {
  return cloudinaryUrl(publicId, { width: 1200, height: 630, fit: "cover" });
}

// Preset: author avatar (square, 128px)
export function avatarUrl(publicId: string): string {
  return cloudinaryUrl(publicId, { width: 128, height: 128, fit: "cover" });
}
