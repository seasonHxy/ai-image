import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "认证失败。" }, { status: 401 });
  }

  const { id } = await params;
  const message = db.getMessageById(id);
  if (!message) {
    return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
  }

  const topic = db.getTopicById(message.topicId);
  if (!topic || topic.userId !== user.id) {
    return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
  }

  if (message.status !== "running" && message.status !== "pending") {
    return NextResponse.json(
      { error: "任务不在运行中，无法取消。" },
      { status: 400 }
    );
  }

  db.updateMessage(id, { status: "cancel_requested" });

  return NextResponse.json({ success: true });
}
