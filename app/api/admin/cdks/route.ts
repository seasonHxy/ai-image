import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateCDK } from "@/lib/auth";
import { checkAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "未授权。" }, { status: 401 });
  }
  const cdks = db.getAllCDKs();
  return NextResponse.json({ cdks });
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "未授权。" }, { status: 401 });
  }
  const body = await req.json();
  const { credits, count, prefix } = body;

  if (!credits || credits < 1) {
    return NextResponse.json({ error: "额度必须大于 0。" }, { status: 400 });
  }

  const numCount = Math.min(count || 1, 100);
  const cdks = [];
  for (let i = 0; i < numCount; i++) {
    const code = prefix ? `${prefix}-${generateCDK()}` : generateCDK();
    try {
      db.createCDK(code, credits);
      cdks.push({ code, credits });
    } catch {
      // duplicate code, retry
      i--;
    }
  }
  return NextResponse.json({ cdks });
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "未授权。" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "请指定卡券代码。" }, { status: 400 });
  }
  db.deleteCDK(code);
  return NextResponse.json({ success: true });
}
