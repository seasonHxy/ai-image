import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const stats = db.getStats();
    return NextResponse.json({
      status: "ok",
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Database not available" },
      { status: 503 }
    );
  }
}
