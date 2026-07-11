import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function NotFound() {
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
      <div style={{ textAlign: "center" }}>
        <Sparkles
          size={40}
          style={{ color: "var(--accent)", marginBottom: "1rem" }}
        />
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground)",
            marginBottom: "1.5rem",
          }}
        >
          页面不存在
        </p>
        <Link href="/" className="task-button task-button-primary">
          返回首页
        </Link>
      </div>
    </div>
  );
}
