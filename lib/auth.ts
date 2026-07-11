import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  if (hashBuf.length !== testBuf.length) return false;
  return timingSafeEqual(hashBuf, testBuf);
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now().toString(36)}${randomBytes(4).toString("hex")}`;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateCDK(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  };
  return `PX-${segment()}-${segment()}-${segment()}-${segment()}`;
}

const SESSION_COOKIE = "ai_image_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function getSessionMaxAge(): number {
  return SESSION_MAX_AGE;
}

const ALLOWED_EMAIL_DOMAINS = new Set([
  "qq.com",
  "gmail.com",
  "googlemail.com",
]);

export function isAllowedEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && ALLOWED_EMAIL_DOMAINS.has(domain);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (password.length < 8) errors.push("至少 8 位");
  if (!/[a-zA-Z]/.test(password)) errors.push("包含字母");
  if (!/\d/.test(password)) errors.push("包含数字");
  if (/\s/.test(password)) errors.push("不要包含空格");
  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ["太弱", "一般", "较强", "很强"];
  return { score: Math.min(score, 3), label: labels[Math.min(score, 3)] };
}
