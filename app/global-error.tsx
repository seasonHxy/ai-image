"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#09090b",
          color: "#fafafa",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            应用错误
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", marginBottom: "1.5rem" }}>
            应用发生了严重错误，请尝试刷新页面。
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "0.625rem",
              border: "none",
              background: "#fafafa",
              color: "#18181b",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            重新加载
          </button>
        </div>
      </body>
    </html>
  );
}
