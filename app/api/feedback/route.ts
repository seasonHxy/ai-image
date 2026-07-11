import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateId } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "认证失败。" }, { status: 401 });
    }

    const ip = getClientIP(req);
    const rl = rateLimit(`feedback:${ip}`, RATE_LIMITS.feedback.max, RATE_LIMITS.feedback.window);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "提交过于频繁，请稍后再试。" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "请输入反馈内容。" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "反馈内容最多 2000 字。" },
        { status: 400 }
      );
    }

    db.createFeedback({
      id: generateId("fb_"),
      userId: user.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "提交反馈失败。" },
      { status: 500 }
    );
  }
}
