"use client";

import { useState } from "react";
import { Sparkles, Zap, History, Layers, ChevronRight } from "lucide-react";
import { AuthDialog } from "./AuthDialog";
import { PresetTemplates } from "./PresetTemplates";
import type { PublicUser } from "@/lib/types";

interface AuthScreenProps {
  onSuccess: (user: PublicUser) => void;
  inviteCode?: string;
}

export function AuthScreen({ onSuccess, inviteCode }: AuthScreenProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };
  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="wordmark">
          <Sparkles size={20} style={{ color: "var(--accent)" }} />
          <span>AI 图片生成</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="task-button task-button-ghost" onClick={openLogin}>
            登录
          </button>
          <button
            className="task-button task-button-primary"
            onClick={openRegister}
          >
            注册
          </button>
        </div>
      </header>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3rem 1.5rem",
          maxWidth: "64rem",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Sparkles size={14} />
            AI 驱动的商业图片生成工作台
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              maxWidth: "36rem",
            }}
          >
            批量生成商业图片，
            <br />
            从一张参考图开始
          </h1>

          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--muted-foreground)",
              lineHeight: 1.7,
              maxWidth: "32rem",
            }}
          >
            上传参考图，选择模板或输入提示词，AI
            会在云端批量生成商品图、人物写真、旅行打卡照等视觉素材。支持多张出图、任务队列、历史复用和持续迭代，不占用本地电脑资源。
          </p>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="task-button task-button-primary"
              onClick={openRegister}
              style={{ padding: "0.625rem 1.5rem", fontSize: "0.9375rem" }}
            >
              免费开始（送 3 张额度）
              <ChevronRight size={16} />
            </button>
            <button
              className="task-button task-button-secondary"
              onClick={openLogin}
              style={{ padding: "0.625rem 1.5rem", fontSize: "0.9375rem" }}
            >
              已有账号
            </button>
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            width: "100%",
            marginBottom: "3rem",
          }}
        >
          {[
            {
              icon: Zap,
              title: "云端批量生成",
              desc: "一次生成最多 12 张，任务队列自动排队",
            },
            {
              icon: Layers,
              title: "参考图驱动",
              desc: "上传参考图保持商品/人物一致性",
            },
            {
              icon: History,
              title: "历史复用",
              desc: "任务历史随时查看，支持重试和迭代",
            },
          ].map((feat) => (
            <div
              key={feat.title}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "calc(var(--radius) * 1.2)",
                padding: "1.25rem",
                background: "var(--card)",
              }}
            >
              <feat.icon
                size={20}
                style={{ color: "var(--accent)", marginBottom: "0.5rem" }}
              />
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted-foreground)",
                  lineHeight: 1.5,
                }}
              >
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Preset Templates Preview */}
        <div style={{ width: "100%" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            模板预览
          </h2>
          <PresetTemplates />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "1.5rem",
          textAlign: "center",
          borderTop: "1px solid var(--border)",
          fontSize: "0.75rem",
          color: "var(--muted-foreground)",
        }}
      >
        <p>注册成功送 3 张额度 · 邀请好友再获额度 · CDK 卡券充值</p>
      </footer>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={onSuccess}
        initialMode={authMode}
        inviteCode={inviteCode}
      />
    </div>
  );
}
