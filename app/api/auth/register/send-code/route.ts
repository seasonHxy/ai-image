import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { isAllowedEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !isAllowedEmail(email)) {
      return NextResponse.json(
        { error: "注册仅支持 QQ 邮箱和 Gmail 邮箱。" },
        { status: 400 }
      );
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已注册。" },
        { status: 400 }
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    db.createVerificationCode({
      email: email.toLowerCase(),
      code,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

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
