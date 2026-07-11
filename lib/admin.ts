import type { NextRequest } from "next/server";

export function checkAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false;
  return token === adminKey;
}

export function getAdminKey(): string {
  return process.env.ADMIN_KEY || "chang-me-in-production";
}
