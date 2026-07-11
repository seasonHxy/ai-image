import { cookies } from "next/headers";
import { db } from "./db";
import { getSessionCookieName, getSessionMaxAge } from "./auth";
import type { User, PublicUser } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(getSessionCookieName())?.value;
  if (!sessionId) return null;
  const session = db.getSession(sessionId);
  if (!session) return null;
  const user = db.getUserById(session.userId);
  if (!user) return null;
  return user;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = getSessionCookieName();
  const token = `${userId}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
  db.createSession({
    id: token,
    userId,
    createdAt: new Date().toISOString(),
  });
  cookieStore.set(sessionId, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: getSessionMaxAge(),
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(getSessionCookieName())?.value;
  if (sessionId) {
    db.deleteSession(sessionId);
  }
  cookieStore.delete(getSessionCookieName());
}

export function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    credits: user.credits,
    inviteCode: user.inviteCode,
    invitedBy: user.invitedBy,
    invitedCount: user.invitedCount,
    createdAt: user.createdAt,
  };
}
