import type {
  User,
  Session,
  Topic,
  Message,
  CDK,
  Feedback,
  VerificationCode,
} from "./types";

interface DataStore {
  users: Map<string, User>;
  sessions: Map<string, Session>;
  topics: Map<string, Topic>;
  messages: Map<string, Message>;
  cdks: Map<string, CDK>;
  feedbacks: Feedback[];
  verificationCodes: Map<string, VerificationCode>;
  emailIndex: Map<string, string>;
  inviteIndex: Map<string, string>;
}

declare global {
  var __aiImageStore: DataStore | undefined;
}

function createStore(): DataStore {
  return {
    users: new Map(),
    sessions: new Map(),
    topics: new Map(),
    messages: new Map(),
    cdks: new Map(),
    feedbacks: [],
    verificationCodes: new Map(),
    emailIndex: new Map(),
    inviteIndex: new Map(),
  };
}

function getStore(): DataStore {
  if (!globalThis.__aiImageStore) {
    globalThis.__aiImageStore = createStore();
    seedCDKs(globalThis.__aiImageStore);
  }
  return globalThis.__aiImageStore;
}

function seedCDKs(store: DataStore): void {
  const codes: Array<{ code: string; credits: number }> = [
    { code: "PX-TEST-0001-CRED-0010", credits: 10 },
    { code: "PX-TEST-0002-CRED-0050", credits: 50 },
    { code: "PX-DEMO-2024-FREE-0003", credits: 3 },
  ];
  for (const { code, credits } of codes) {
    store.cdks.set(code, { code, credits });
  }
}

export const db = {
  get store() {
    return getStore();
  },

  getUserById(id: string): User | undefined {
    return getStore().users.get(id);
  },

  getUserByEmail(email: string): User | undefined {
    const id = getStore().emailIndex.get(email.toLowerCase());
    return id ? getStore().users.get(id) : undefined;
  },

  getUserByInviteCode(code: string): User | undefined {
    const id = getStore().inviteIndex.get(code.toUpperCase());
    return id ? getStore().users.get(id) : undefined;
  },

  createUser(user: User): void {
    const store = getStore();
    store.users.set(user.id, user);
    store.emailIndex.set(user.email.toLowerCase(), user.id);
    store.inviteIndex.set(user.inviteCode, user.id);
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const store = getStore();
    const user = store.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    store.users.set(id, updated);
    return updated;
  },

  createSession(session: Session): void {
    getStore().sessions.set(session.id, session);
  },

  getSession(id: string): Session | undefined {
    return getStore().sessions.get(id);
  },

  deleteSession(id: string): void {
    getStore().sessions.delete(id);
  },

  getTopicsByUserId(userId: string): Topic[] {
    return Array.from(getStore().topics.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  getTopicById(id: string): Topic | undefined {
    return getStore().topics.get(id);
  },

  createTopic(topic: Topic): void {
    getStore().topics.set(topic.id, topic);
  },

  updateTopic(id: string, updates: Partial<Topic>): Topic | undefined {
    const store = getStore();
    const topic = store.topics.get(id);
    if (!topic) return undefined;
    const updated = { ...topic, ...updates };
    store.topics.set(id, updated);
    return updated;
  },

  deleteTopic(id: string): void {
    const store = getStore();
    store.topics.delete(id);
    const messagesToDelete = Array.from(store.messages.values()).filter(
      (m) => m.topicId === id
    );
    for (const msg of messagesToDelete) {
      store.messages.delete(msg.id);
    }
  },

  getMessagesByTopicId(topicId: string): Message[] {
    return Array.from(getStore().messages.values())
      .filter((m) => m.topicId === topicId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  getMessageById(id: string): Message | undefined {
    return getStore().messages.get(id);
  },

  createMessage(message: Message): void {
    getStore().messages.set(message.id, message);
  },

  updateMessage(id: string, updates: Partial<Message>): Message | undefined {
    const store = getStore();
    const msg = store.messages.get(id);
    if (!msg) return undefined;
    const updated = { ...msg, ...updates };
    store.messages.set(id, updated);
    return updated;
  },

  getCDK(code: string): CDK | undefined {
    return getStore().cdks.get(code.toUpperCase());
  },

  redeemCDK(code: string, userId: string): CDK | undefined {
    const store = getStore();
    const cdk = store.cdks.get(code.toUpperCase());
    if (!cdk || cdk.redeemedBy) return undefined;
    const updated = { ...cdk, redeemedBy: userId, redeemedAt: new Date().toISOString() };
    store.cdks.set(code.toUpperCase(), updated);
    return updated;
  },

  createFeedback(feedback: Feedback): void {
    getStore().feedbacks.push(feedback);
  },

  createVerificationCode(vcode: VerificationCode): void {
    getStore().verificationCodes.set(
      `${vcode.email.toLowerCase()}:${vcode.purpose}`,
      vcode
    );
  },

  getVerificationCode(
    email: string,
    purpose: "register" | "reset"
  ): VerificationCode | undefined {
    return getStore().verificationCodes.get(`${email.toLowerCase()}:${purpose}`);
  },

  deleteVerificationCode(email: string, purpose: "register" | "reset"): void {
    getStore().verificationCodes.delete(`${email.toLowerCase()}:${purpose}`);
  },
};
