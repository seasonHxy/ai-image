import { writeFileSync, existsSync, readFileSync } from "fs";
import { join, extname } from "path";
import { generateId } from "./auth";

const UPLOADS_DIR = join(process.cwd(), "data", "uploads", "references");

export function saveReferenceImage(
  buffer: Buffer,
  mimeType: string
): { id: string; path: string; url: string } {
  const ext = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : mimeType === "image/gif" ? "gif" : "png";
  const id = generateId("ref_");
  const filename = `${id}.${ext}`;
  const filePath = join(UPLOADS_DIR, filename);
  writeFileSync(filePath, buffer);
  return {
    id,
    path: filePath,
    url: `/api/uploads/${filename}`,
  };
}

export function getReferenceImageFile(
  filename: string
): { data: Buffer; mimeType: string } | null {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  const filePath = join(UPLOADS_DIR, safeName);
  if (!existsSync(filePath)) return null;
  const ext = extname(safeName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  const mimeType = mimeTypes[ext] || "application/octet-stream";
  return { data: readFileSync(filePath), mimeType };
}
