import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, validatePassword } from "@/lib/auth";
import { getCurrentUser, publicUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "认证失败。" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, password, passwordConfirm } = body;

    if (!currentPassword || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: "请填写所有字段。" },
        { status: 400 }
      );
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "当前密码不正确。" },
        { status: 400 }
      );
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: "两次输入的新密码不一致。" },
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

    const updated = db.updateUser(user.id, {
      passwordHash: hashPassword(password),
    });

    return NextResponse.json({ user: updated ? publicUser(updated) : null });
  } catch {
    return NextResponse.json(
      { error: "修改密码失败。" },
      { status: 500 }
    );
  }
}
