import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "未授权。" }, { status: 401 });
  }
  const users = db.getAllUsers();
  const safeUsers = users.map((u) => {
    const { passwordHash: _ph, ...rest } = u;
    void _ph;
    return rest;
  });
  return NextResponse.json({ users: safeUsers });
}
