import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { generateId } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "认证失败。" }, { status: 401 });
  }

  const topics = db.getTopicsByUserId(user.id);
  const topicsWithMessages = topics.map((topic) => {
    const messages = db.getMessagesByTopicId(topic.id);
    return { ...topic, messages };
  });

  return NextResponse.json({ topics: topicsWithMessages });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "认证失败。" }, { status: 401 });
    }

    const body = await req.json();
    const title = body.title || "新任务";

    const topicId = generateId("top_");
    const now = new Date().toISOString();

    db.createTopic({
      id: topicId,
      userId: user.id,
      title,
      status: "idle",
      createdAt: now,
      updatedAt: now,
    });

    const topic = db.getTopicById(topicId)!;
    return NextResponse.json({ topic });
  } catch {
    return NextResponse.json({ error: "创建任务失败。" }, { status: 500 });
  }
}
