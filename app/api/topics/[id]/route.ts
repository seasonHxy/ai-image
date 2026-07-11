import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "认证失败。" }, { status: 401 });
  }

  const { id } = await params;
  const topic = db.getTopicById(id);
  if (!topic || topic.userId !== user.id) {
    return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
  }

  const messages = db.getMessagesByTopicId(id);
  return NextResponse.json({ topic: { ...topic, messages } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "认证失败。" }, { status: 401 });
  }

  const { id } = await params;
  const topic = db.getTopicById(id);
  if (!topic || topic.userId !== user.id) {
    return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
  }

  const body = await req.json();
  const updates: { title?: string } = {};
  if (body.title) updates.title = body.title;

  const updated = db.updateTopic(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ topic: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "认证失败。" }, { status: 401 });
  }

  const { id } = await params;
  const topic = db.getTopicById(id);
  if (!topic || topic.userId !== user.id) {
    return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
  }

  db.deleteTopic(id);
  return NextResponse.json({ success: true });
}
