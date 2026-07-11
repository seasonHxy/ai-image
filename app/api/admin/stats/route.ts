import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "未授权。" }, { status: 401 });
  }
  const stats = db.getStats();
  return NextResponse.json({ stats });
}
