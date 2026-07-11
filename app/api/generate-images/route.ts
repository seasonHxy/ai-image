import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { generateId } from "@/lib/auth";
import { getCurrentUser, publicUser } from "@/lib/session";
import { parseSize, generateImageUrl } from "@/lib/utils";
import type { GeneratedImage, ReferenceImage, Message } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "认证失败。" }, { status: 401 });
    }

    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;
    const count = parseInt(formData.get("count") as string, 10);
    const size = (formData.get("size") as string) || "1024x1024";
    const topicId = formData.get("topicId") as string;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "请输入提示词。" }, { status: 400 });
    }

    if (!count || count < 1 || count > 12) {
      return NextResponse.json(
        { error: "张数需在 1-12 之间。" },
        { status: 400 }
      );
    }

    if (user.credits < count) {
      return NextResponse.json(
        { error: `额度不足，当前余额 ${user.credits} 张，需要 ${count} 张。` },
        { status: 400 }
      );
    }

    const topic = db.getTopicById(topicId);
    if (!topic || topic.userId !== user.id) {
      return NextResponse.json({ error: "任务不存在。" }, { status: 404 });
    }

    if (topic.status === "running" || topic.status === "canceling") {
      return NextResponse.json(
        { error: "当前任务正在运行，完成或取消前不能继续提交。" },
        { status: 400 }
      );
    }

    const referenceFiles = formData.getAll("referenceImages") as File[];
    const refLabels = formData.getAll("referenceImageLabels") as string[];

    const referenceImages: ReferenceImage[] = [];
    for (let i = 0; i < referenceFiles.length; i++) {
      const file = referenceFiles[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      referenceImages.push({
        id: generateId("refq_"),
        messageId: "",
        imageData: base64,
        name: file.name,
        label: refLabels[i] || `参考图${i + 1}`,
        createdAt: new Date().toISOString(),
        mimeType: file.type,
        indexInMessage: i,
      });
    }

    db.updateUser(user.id, { credits: user.credits - count });
    db.updateTopic(topicId, {
      status: "running",
      updatedAt: new Date().toISOString(),
    });

    const messageId = generateId("msg_");
    const { width, height } = parseSize(size);

    const images: GeneratedImage[] = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 1000000);
      const variedPrompt = i === 0 ? prompt : `${prompt} variation ${i + 1}`;
      const imageUrl = generateImageUrl(variedPrompt, width, height, seed);
      images.push({
        id: generateId("img_"),
        messageId,
        imageData: imageUrl,
        prompt,
        serial: i + 1,
        createdAt: new Date().toISOString(),
        mimeType: "image/png",
        indexInMessage: i,
      });
    }

    const message: Message = {
      id: messageId,
      topicId,
      prompt: prompt.trim(),
      count,
      size,
      status: "running",
      images,
      referenceImages,
      createdAt: new Date().toISOString(),
    };

    db.createMessage(message);

    const generationTime = Math.min(3000 + count * 1000, 10000);
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

      const currentTopic = db.getTopicById(topicId);
      if (currentTopic) {
        db.updateTopic(topicId, {
          status: "idle",
          updatedAt: new Date().toISOString(),
        });
      }
    }, generationTime);

    const updatedUser = db.getUserById(user.id)!;
    const updatedTopic = db.getTopicById(topicId)!;

    return NextResponse.json({
      user: publicUser(updatedUser),
      topic: updatedTopic,
      message,
    });
  } catch {
    return NextResponse.json({ error: "生成失败。" }, { status: 500 });
  }
}
