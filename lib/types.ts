export interface User {
  id: string;
  email: string;
  passwordHash: string;
  nickname: string;
  credits: number;
  inviteCode: string;
  invitedBy?: string;
  invitedCount: number;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  userId: string;
  title: string;
  status: TopicStatus;
  createdAt: string;
  updatedAt: string;
}

export type TopicStatus = "idle" | "running" | "canceling";

export interface Message {
  id: string;
  topicId: string;
  prompt: string;
  count: number;
  size: string;
  status: MessageStatus;
  images: GeneratedImage[];
  referenceImages: ReferenceImage[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export type MessageStatus =
  | "pending"
  | "running"
  | "cancel_requested"
  | "completed"
  | "failed"
  | "canceled";

export interface GeneratedImage {
  id: string;
  messageId: string;
  imageData: string;
  prompt: string;
  serial: number;
  createdAt: string;
  mimeType: string;
  indexInMessage: number;
}

export interface ReferenceImage {
  id: string;
  messageId: string;
  imageData: string;
  name: string;
  label: string;
  createdAt: string;
  mimeType: string;
  indexInMessage: number;
}

export interface CDK {
  code: string;
  credits: number;
  redeemedBy?: string;
  redeemedAt?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface VerificationCode {
  email: string;
  code: string;
  purpose: "register" | "reset";
  expiresAt: string;
}

export interface PresetTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  count: number;
  size: string;
  imageSrc: string;
  imageAlt: string;
  needsReference: boolean;
}

export const SIZES = ["1024x1024", "1024x1536", "1536x1024", "auto"] as const;
export type Size = (typeof SIZES)[number];

export const SIZE_LABELS: Record<string, string> = {
  "1024x1024": "方图",
  "1024x1536": "竖图",
  "1536x1024": "横图",
  auto: "自动",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "排队中",
  running: "生成中",
  cancel_requested: "取消中",
  completed: "已完成",
  failed: "失败",
  canceled: "已取消",
  idle: "空闲",
};

export const MAX_REFERENCE_IMAGES = 8;
export const MAX_GENERATE_COUNT = 12;
export const FREE_SIGNUP_CREDITS = 3;
export const INVITE_CREDITS = 3;
export const MAX_INVITE_REWARDS = 3;

export interface PublicUser {
  id: string;
  email: string;
  nickname: string;
  credits: number;
  inviteCode: string;
  invitedBy?: string;
  invitedCount: number;
  createdAt: string;
}
