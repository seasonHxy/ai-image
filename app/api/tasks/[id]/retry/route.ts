import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { generateId } from "@/lib/auth";
import { getCurrentUser, publicUser } from "@/lib/session";
import { parseSize, generateImageUrl } from "@/lib/utils";
import type { GeneratedImage, Message } from "@/lib/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "认证失败。" }, { status: 401 });
  }

  const { id } = await params;
  const oldMessage = db.getMessageById(id);
  if (!oldMessage) {
    return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
  }

  const topic = db.getTopicById(oldMessage.topicId);
  if (!topic || topic.userId !== user.id) {
    return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
  }

  if (oldMessage.status !== "failed" && oldMessage.status !== "canceled") {
    return NextResponse.json(
      { error: "只有失败或已取消的任务可以重试。" },
      { status: 400 }
    );
  }

  if (topic.status === "running" || topic.status === "canceling") {
    return NextResponse.json(
      { error: "当前任务正在运行，完成或取消前不能继续提交。" },
      { status: 400 }
    );
  }

  if (user.credits < oldMessage.count) {
    return NextResponse.json(
      { error: `额度不足，当前余额 ${user.credits} 张，需要 ${oldMessage.count} 张。` },
      { status: 400 }
    );
  }

  db.updateUser(user.id, { credits: user.credits - oldMessage.count });
  db.updateTopic(topic.id, {
    status: "running",
    updatedAt: new Date().toISOString(),
  });

  const messageId = generateId("msg_");
  const { width, height } = parseSize(oldMessage.size);

  const images: GeneratedImage[] = [];
  for (let i = 0; i < oldMessage.count; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    const variedPrompt =
      i === 0 ? oldMessage.prompt : `${oldMessage.prompt} variation ${i + 1}`;
    const imageUrl = generateImageUrl(variedPrompt, width, height, seed);
    images.push({
      id: generateId("img_"),
      messageId,
      imageData: imageUrl,
      prompt: oldMessage.prompt,
      serial: i + 1,
      createdAt: new Date().toISOString(),
      mimeType: "image/png",
      indexInMessage: i,
    });
  }

  const message: Message = {
    id: messageId,
    topicId: topic.id,
    prompt: oldMessage.prompt,
    count: oldMessage.count,
    size: oldMessage.size,
    status: "running",
    images,
    referenceImages: oldMessage.referenceImages.map((ref, i) => ({
      ...ref,
      id: generateId("refq_"),
      messageId,
      indexInMessage: i,
    })),
    createdAt: new Date().toISOString(),
  };

  db.createMessage(message);

  const generationTime = Math.min(3000 + message.count * 1000, 10000);
  setTimeout(() => {
    const currentMsg = db.getMessageById(messageId);
    if (!currentMsg) return;

    if (currentMsg.status === "cancel_requested") {
      const completedCount = currentMsg.images.filter(
        (img) => img.imageData
      ).length;
      const refundCount = currentMsg.count - completedCount;
      const currentUser = db.getUserById(user.id);
      if (currentUser && refundCount > 0) {
        db.updateUser(user.id, {
          credits: currentUser.credits + refundCount,
        });
      }
      db.updateMessage(messageId, {
        status: "canceled",
        completedAt: new Date().toISOString(),
      });
    } else {
      db.updateMessage(messageId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
    }

    const currentTopic = db.getTopicById(topic.id);
    if (currentTopic) {
      db.updateTopic(topic.id, {
        status: "idle",
        updatedAt: new Date().toISOString(),
      });
    }
  }, generationTime);

  const updatedUser = db.getUserById(user.id)!;
  const updatedTopic = db.getTopicById(topic.id)!;

  return NextResponse.json({
    user: publicUser(updatedUser),
    topic: updatedTopic,
    message,
  });
}
