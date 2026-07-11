import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { getCurrentUser, publicUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "认证失败。" }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "请输入卡券 CDK。" },
        { status: 400 }
      );
    }

    const cdk = db.redeemCDK(code.trim(), user.id);
    if (!cdk) {
      return NextResponse.json({ error: "兑换失败。" }, { status: 400 });
    }

    const updated = db.updateUser(user.id, {
      credits: user.credits + cdk.credits,
    });

    return NextResponse.json({
      user: updated ? publicUser(updated) : null,
      credits: cdk.credits,
    });
  } catch {
    return NextResponse.json({ error: "兑换失败。" }, { status: 500 });
  }
}
