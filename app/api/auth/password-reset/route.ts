import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth";
import { setSessionCookie, publicUser } from "@/lib/session";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = rateLimit(`passwordReset:${ip}`, RATE_LIMITS.passwordReset.max, RATE_LIMITS.passwordReset.window);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "操作过于频繁，请稍后再试。" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, code, password } = body;

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "请填写所有字段。" },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "该邮箱未注册。" },
        { status: 400 }
      );
    }

    const vcode = db.getVerificationCode(email, "reset");
    if (!vcode || vcode.code !== code) {
      return NextResponse.json(
        { error: "验证码不正确。" },
        { status: 400 }
      );
    }

    if (new Date(vcode.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "验证码已过期，请重新发送。" },
        { status: 400 }
      );
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        { error: pwCheck.errors.join("，") },
        { status: 400 }
      );
    }

    db.updateUser(user.id, {
      passwordHash: hashPassword(password),
    });

    db.deleteVerificationCode(email, "reset");

    await setSessionCookie(user.id);

    const updated = db.getUserById(user.id)!;
    return NextResponse.json({ user: publicUser(updated) });
  } catch {
    return NextResponse.json(
      { error: "重置密码失败。" },
      { status: 500 }
    );
  }
}
