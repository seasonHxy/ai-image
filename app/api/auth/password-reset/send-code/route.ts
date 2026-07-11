import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAllowedEmail } from "@/lib/auth";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = rateLimit(`sendCode:${ip}`, RATE_LIMITS.sendCode.max, RATE_LIMITS.sendCode.window);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "验证码发送过于频繁，请稍后再试。" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || !isAllowedEmail(email)) {
      return NextResponse.json(
        { error: "仅支持 QQ 邮箱和 Gmail 邮箱。" },
        { status: 400 }
      );
    }

    const existing = db.getUserByEmail(email);
    if (!existing) {
      return NextResponse.json(
        { error: "该邮箱未注册。" },
        { status: 400 }
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    db.createVerificationCode({
      email: email.toLowerCase(),
      code,
      purpose: "reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (process.env.EMAIL_ENABLED === "true" && process.env.SMTP_HOST) {
      // TODO: Send email via SMTP
      return NextResponse.json({ message: "验证码已发送。" });
    }

    return NextResponse.json({
      message: "验证码已发送。",
      demoCode: code,
    });
  } catch {
    return NextResponse.json(
      { error: "验证码发送失败。" },
      { status: 500 }
    );
  }
}
