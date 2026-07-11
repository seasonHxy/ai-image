import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie, publicUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
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
