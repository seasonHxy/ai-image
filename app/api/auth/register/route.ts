import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  generateId,
  generateInviteCode,
  isAllowedEmail,
  validatePassword,
} from "@/lib/auth";
import { setSessionCookie, publicUser } from "@/lib/session";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";
import {
  FREE_SIGNUP_CREDITS,
  INVITE_CREDITS,
  MAX_INVITE_REWARDS,
} from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = rateLimit(`register:${ip}`, RATE_LIMITS.register.max, RATE_LIMITS.register.window);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "注册操作过于频繁，请稍后再试。" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, nickname, code, inviteCode } = body;

    if (!email || !password || !nickname) {
      return NextResponse.json({ error: "请填写所有必填字段。" }, { status: 400 });
    }

    if (!isAllowedEmail(email)) {
      return NextResponse.json(
        { error: "注册仅支持 QQ 邮箱和 Gmail 邮箱。" },
        { status: 400 }
      );
    }

    if (nickname.length > 30) {
      return NextResponse.json(
        { error: "昵称最多 30 个字符。" },
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

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已注册。" },
        { status: 400 }
      );
    }

    const vcode = db.getVerificationCode(email, "register");
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

    let inviterId: string | undefined;
    if (inviteCode) {
      const inviter = db.getUserByInviteCode(inviteCode);
      if (inviter) {
        inviterId = inviter.id;
      }
    }

    const userId = generateId("usr_");
    const userInviteCode = generateInviteCode();

    db.createUser({
      id: userId,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      nickname: nickname.trim(),
      credits: FREE_SIGNUP_CREDITS,
      inviteCode: userInviteCode,
      invitedBy: inviterId,
      invitedCount: 0,
      createdAt: new Date().toISOString(),
    });

    if (inviterId) {
      const inviter = db.getUserById(inviterId);
      if (inviter && inviter.invitedCount < MAX_INVITE_REWARDS) {
        db.updateUser(inviterId, {
          credits: inviter.credits + INVITE_CREDITS,
          invitedCount: inviter.invitedCount + 1,
        });
      }
    }

    db.deleteVerificationCode(email, "register");

    await setSessionCookie(userId);

    const user = db.getUserById(userId)!;
    return NextResponse.json({ user: publicUser(user) });
  } catch {
    return NextResponse.json({ error: "注册失败，请重试。" }, { status: 500 });
  }
}
