import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "未授权。" }, { status: 401 });
  }
  const feedbacks = db.getAllFeedbacks();
  const users = db.getAllUsers();
  const userMap = new Map(users.map((u) => [u.id, u.nickname]));
  const feedbacksWithUser = feedbacks.map((f) => ({
    ...f,
    nickname: userMap.get(f.userId) || "未知用户",
  }));
  return NextResponse.json({ feedbacks: feedbacksWithUser });
}
