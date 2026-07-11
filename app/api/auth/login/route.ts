import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie, publicUser } from "@/lib/session";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = rateLimit(`login:${ip}`, RATE_LIMITS.login.max, RATE_LIMITS.login.window);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "操作过于频繁，请稍后再试。" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "请填写邮箱和密码。" },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "邮箱或密码不正确。" },
        { status: 400 }
      );
    }

    await setSessionCookie(user.id);

    return NextResponse.json({ user: publicUser(user) });
  } catch {
    return NextResponse.json({ error: "登录失败。" }, { status: 500 });
  }
}
