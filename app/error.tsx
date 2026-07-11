"use client";

import { Sparkles, RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "var(--background)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "28rem",
        }}
      >
        <Sparkles
          size={40}
          style={{ color: "var(--accent)", marginBottom: "1rem" }}
        />
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          出错了
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground)",
            marginBottom: "1.5rem",
            lineHeight: 1.6,
          }}
        >
          页面加载时发生了错误。请尝试刷新页面，如果问题持续存在，请提交反馈。
        </p>
        <button
          className="task-button task-button-primary"
          onClick={reset}
        >
          <RefreshCw size={14} />
          重新加载
        </button>
      </div>
    </div>
  );
}
