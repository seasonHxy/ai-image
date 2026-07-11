import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const title = "AI 图片生成工作台 — 批量生成商业图片";
const description =
  "上传参考图，选择模板或输入提示词，AI 在云端批量生成商品图、人物写真、旅行打卡照等视觉素材。支持多张出图、任务队列、历史复用和持续迭代。";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | AI 图片生成",
  },
  description,
  keywords: [
    "AI图片生成",
    "批量生成图片",
    "商业图片",
    "商品图",
    "AI写真",
    "参考图生成",
    "电商图片",
    "图片生成工具",
  ],
  authors: [{ name: "AI 图片生成" }],
  creator: "AI 图片生成",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    title,
    description,
    siteName: "AI 图片生成工作台",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
