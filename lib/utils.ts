export function sanitizeFilename(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return slug || "ai-image";
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

export function formatDateTimeTitle(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

export function getMimeTypeExt(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "png";
  }
}

export function parseSize(size: string): { width: number; height: number } {
  if (size === "auto") return { width: 1024, height: 1024 };
  const [w, h] = size.split("x").map(Number);
  return { width: w || 1024, height: h || 1024 };
}

export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function generateImageUrl(
  prompt: string,
  width: number,
  height: number,
  seed: number
): string {
  const encoded = encodeURIComponent(prompt.slice(0, 500));
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
}

export function clsx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
