import { NextRequest, NextResponse } from "next/server";
import { getReferenceImageFile } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const file = getReferenceImageFile(filename);
  if (!file) {
    return NextResponse.json({ error: "文件不存在。" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
