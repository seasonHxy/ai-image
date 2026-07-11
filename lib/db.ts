/* eslint-disable @typescript-eslint/no-explicit-any */
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { join } from "path";
import type {
  User,
  Session,
  Topic,
  Message,
  CDK,
  Feedback,
  VerificationCode,
  GeneratedImage,
  ReferenceImage,
} from "./types";

const DATA_DIR = join(process.cwd(), "data");
const UPLOADS_DIR = join(DATA_DIR, "uploads", "references");
const DB_PATH = join(DATA_DIR, "ai-image.db");

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(UPLOADS_DIR, { recursive: true });

declare global {
  var __betterSqlite: Database.Database | undefined;
}

function getDb(): Database.Database {
  if (!globalThis.__betterSqlite) {
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
    seedData(db);
    globalThis.__betterSqlite = db;
  }
  return globalThis.__betterSqlite;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL,
      credits INTEGER DEFAULT 0,
      invite_code TEXT UNIQUE NOT NULL,
      invited_by TEXT,
      invited_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'idle',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_topics_user ON topics(user_id);

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      count INTEGER NOT NULL,
      size TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      error TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      images TEXT DEFAULT '[]',
      reference_images TEXT DEFAULT '[]',
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_messages_topic ON messages(topic_id);

    CREATE TABLE IF NOT EXISTS cdks (
      code TEXT PRIMARY KEY,
      credits INTEGER NOT NULL,
      redeemed_by TEXT,
      redeemed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      key TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);
}

function seedData(db: Database.Database): void {
  const count = db.prepare("SELECT COUNT(*) as c FROM cdks").get() as {
    c: number;
  };
  if (count.c === 0) {
    const insert = db.prepare(
      "INSERT INTO cdks (code, credits) VALUES (?, ?)"
    );
    const seeds = [
      ["PX-TEST-0001-CRED-0010", 10],
      ["PX-TEST-0002-CRED-0050", 50],
      ["PX-DEMO-2024-FREE-0003", 3],
    ];
    for (const [code, credits] of seeds) {
      insert.run(code, credits);
    }
  }
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    nickname: row.nickname,
    credits: row.credits,
    inviteCode: row.invite_code,
    invitedBy: row.invited_by || undefined,
    invitedCount: row.invited_count,
    createdAt: row.created_at,
  };
}

function rowToTopic(row: any): Topic {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMessage(row: any): Message {
  return {
    id: row.id,
    topicId: row.topic_id,
    prompt: row.prompt,
    count: row.count,
    size: row.size,
    status: row.status,
    error: row.error || undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at || undefined,
    images: JSON.parse(row.images || "[]") as GeneratedImage[],
    referenceImages: JSON.parse(
      row.reference_images || "[]"
    ) as ReferenceImage[],
  };
}

export const db = {
  getUserById(id: string): User | undefined {
    const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    return row ? rowToUser(row) : undefined;
  },

  getUserByEmail(email: string): User | undefined {
    const row = getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase()) as any;
    return row ? rowToUser(row) : undefined;
  },

  getUserByInviteCode(code: string): User | undefined {
    const row = getDb()
      .prepare("SELECT * FROM users WHERE invite_code = ?")
      .get(code.toUpperCase()) as any;
    return row ? rowToUser(row) : undefined;
  },

  createUser(user: User): void {
    getDb()
      .prepare(
        `INSERT INTO users (id, email, password_hash, nickname, credits, invite_code, invited_by, invited_count, created_at)
         VALUES (@id, @email, @passwordHash, @nickname, @credits, @inviteCode, @invitedBy, @invitedCount, @createdAt)`
      )
      .run({
        id: user.id,
        email: user.email.toLowerCase(),
        password_hash: user.passwordHash,
        nickname: user.nickname,
        credits: user.credits,
        invite_code: user.inviteCode,
        invited_by: user.invitedBy || null,
        invited_count: user.invitedCount,
        created_at: user.createdAt,
      });
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    const merged = { ...user, ...updates };
    getDb()
      .prepare(
        `UPDATE users SET password_hash = ?, nickname = ?, credits = ?, invite_code = ?, invited_by = ?, invited_count = ? WHERE id = ?`
      )
      .run(
        merged.passwordHash,
        merged.nickname,
        merged.credits,
        merged.inviteCode,
        merged.invitedBy || null,
        merged.invitedCount,
        id
      );
    return merged;
  },

  createSession(session: Session): void {
    getDb()
      .prepare(
        "INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)"
      )
      .run(session.id, session.userId, session.createdAt);
  },

  getSession(id: string): Session | undefined {
    const row = getDb()
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(id) as any;
    return row
      ? {
          id: row.id,
          userId: row.user_id,
          createdAt: row.created_at,
        }
      : undefined;
  },

  deleteSession(id: string): void {
    getDb().prepare("DELETE FROM sessions WHERE id = ?").run(id);
  },

  getTopicsByUserId(userId: string): Topic[] {
    const rows = getDb()
      .prepare("SELECT * FROM topics WHERE user_id = ? ORDER BY updated_at DESC")
      .all(userId);
    return rows.map(rowToTopic);
  },

  getTopicById(id: string): Topic | undefined {
    const row = getDb().prepare("SELECT * FROM topics WHERE id = ?").get(id) as any;
    return row ? rowToTopic(row) : undefined;
  },

  createTopic(topic: Topic): void {
    getDb()
      .prepare(
        `INSERT INTO topics (id, user_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        topic.id,
        topic.userId,
        topic.title,
        topic.status,
        topic.createdAt,
        topic.updatedAt
      );
  },

  updateTopic(id: string, updates: Partial<Topic>): Topic | undefined {
    const topic = this.getTopicById(id);
    if (!topic) return undefined;
    const merged = { ...topic, ...updates };
    getDb()
      .prepare(
        "UPDATE topics SET title = ?, status = ?, updated_at = ? WHERE id = ?"
      )
      .run(merged.title, merged.status, merged.updatedAt, id);
    return merged;
  },

  deleteTopic(id: string): void {
    getDb().prepare("DELETE FROM topics WHERE id = ?").run(id);
  },

  getMessagesByTopicId(topicId: string): Message[] {
    const rows = getDb()
      .prepare("SELECT * FROM messages WHERE topic_id = ? ORDER BY created_at ASC")
      .all(topicId);
    return rows.map(rowToMessage);
  },

  getMessageById(id: string): Message | undefined {
    const row = getDb()
      .prepare("SELECT * FROM messages WHERE id = ?")
      .get(id) as any;
    return row ? rowToMessage(row) : undefined;
  },

  createMessage(message: Message): void {
    getDb()
      .prepare(
        `INSERT INTO messages (id, topic_id, prompt, count, size, status, error, created_at, completed_at, images, reference_images)
         VALUES (@id, @topicId, @prompt, @count, @size, @status, @error, @createdAt, @completedAt, @images, @referenceImages)`
      )
      .run({
        id: message.id,
        topic_id: message.topicId,
        prompt: message.prompt,
        count: message.count,
        size: message.size,
        status: message.status,
        error: message.error || null,
        created_at: message.createdAt,
        completed_at: message.completedAt || null,
        images: JSON.stringify(message.images || []),
        reference_images: JSON.stringify(message.referenceImages || []),
      });
  },

  updateMessage(id: string, updates: Partial<Message>): Message | undefined {
    const msg = this.getMessageById(id);
    if (!msg) return undefined;
    const merged = { ...msg, ...updates };
    getDb()
      .prepare(
        `UPDATE messages SET status = ?, error = ?, completed_at = ?, images = ?, reference_images = ? WHERE id = ?`
      )
      .run(
        merged.status,
        merged.error || null,
        merged.completedAt || null,
        JSON.stringify(merged.images || []),
        JSON.stringify(merged.referenceImages || []),
        id
      );
    return merged;
  },

  getCDK(code: string): CDK | undefined {
    const row = getDb()
      .prepare("SELECT * FROM cdks WHERE code = ?")
      .get(code.toUpperCase()) as any;
    return row
      ? {
          code: row.code,
          credits: row.credits,
          redeemedBy: row.redeemed_by || undefined,
          redeemedAt: row.redeemed_at || undefined,
        }
      : undefined;
  },

  redeemCDK(code: string, userId: string): CDK | undefined {
    const cdk = this.getCDK(code);
    if (!cdk || cdk.redeemedBy) return undefined;
    getDb()
      .prepare("UPDATE cdks SET redeemed_by = ?, redeemed_at = ? WHERE code = ?")
      .run(userId, new Date().toISOString(), code.toUpperCase());
    return { ...cdk, redeemedBy: userId, redeemedAt: new Date().toISOString() };
  },

  createCDK(code: string, credits: number): CDK {
    getDb()
      .prepare("INSERT INTO cdks (code, credits) VALUES (?, ?)")
      .run(code, credits);
    return { code, credits };
  },

  getAllCDKs(): CDK[] {
    const rows = getDb()
      .prepare("SELECT * FROM cdks ORDER BY rowid DESC")
      .all();
    return rows.map((row: any) => ({
      code: row.code,
      credits: row.credits,
      redeemedBy: row.redeemed_by || undefined,
      redeemedAt: row.redeemed_at || undefined,
    }));
  },

  deleteCDK(code: string): void {
    getDb().prepare("DELETE FROM cdks WHERE code = ?").run(code.toUpperCase());
  },

  createFeedback(feedback: Feedback): void {
    getDb()
      .prepare(
        "INSERT INTO feedbacks (id, user_id, content, created_at) VALUES (?, ?, ?, ?)"
      )
      .run(
        feedback.id,
        feedback.userId,
        feedback.content,
        feedback.createdAt
      );
  },

  getAllFeedbacks(): Feedback[] {
    const rows = getDb()
      .prepare("SELECT * FROM feedbacks ORDER BY created_at DESC")
      .all();
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
    }));
  },

  createVerificationCode(vcode: VerificationCode): void {
    getDb()
      .prepare(
        `INSERT OR REPLACE INTO verification_codes (key, email, code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        `${vcode.email.toLowerCase()}:${vcode.purpose}`,
        vcode.email.toLowerCase(),
        vcode.code,
        vcode.purpose,
        vcode.expiresAt
      );
  },

  getVerificationCode(
    email: string,
    purpose: "register" | "reset"
  ): VerificationCode | undefined {
    const row = getDb()
      .prepare("SELECT * FROM verification_codes WHERE key = ?")
      .get(`${email.toLowerCase()}:${purpose}`) as any;
    return row
      ? {
          email: row.email,
          code: row.code,
          purpose: row.purpose,
          expiresAt: row.expires_at,
        }
      : undefined;
  },

  deleteVerificationCode(email: string, purpose: "register" | "reset"): void {
    getDb()
      .prepare("DELETE FROM verification_codes WHERE key = ?")
      .run(`${email.toLowerCase()}:${purpose}`);
  },

  getAllUsers(): User[] {
    const rows = getDb()
      .prepare("SELECT * FROM users ORDER BY created_at DESC")
      .all();
    return rows.map(rowToUser);
  },

  getStats() {
    const db = getDb();
    const users = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
    const topics = (db.prepare("SELECT COUNT(*) as c FROM topics").get() as any).c;
    const messages = (db.prepare("SELECT COUNT(*) as c FROM messages").get() as any).c;
    const cdks = (db.prepare("SELECT COUNT(*) as c FROM cdks").get() as any).c;
    const redeemedCdks = (db.prepare("SELECT COUNT(*) as c FROM cdks WHERE redeemed_by IS NOT NULL").get() as any).c;
    const feedbacks = (db.prepare("SELECT COUNT(*) as c FROM feedbacks").get() as any).c;
    const totalCredits = (db.prepare("SELECT SUM(credits) as s FROM users").get() as any).s || 0;
    return { users, topics, messages, cdks, redeemedCdks, feedbacks, totalCredits };
  },
};
