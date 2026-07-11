"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  User,
  KeyRound,
  Gift,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Dialog } from "./ui/Dialog";
import { useToast } from "./ui/Toast";
import { getPasswordStrength } from "@/lib/auth";
import type { PublicUser } from "@/lib/types";

type AuthMode = "login" | "register" | "reset";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: PublicUser) => void;
  initialMode?: AuthMode;
  inviteCode?: string;
}

export function AuthDialog({
  open,
  onClose,
  onSuccess,
  initialMode = "login",
  inviteCode: initialInviteCode,
}: AuthDialogProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [inviteCode, setInviteCode] = useState(initialInviteCode || "");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(initialMode);
      setError("");
      setDemoCode("");
    }
  }, [open, initialMode]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email) {
      setError("请输入邮箱。");
      return;
    }
    setError("");
    try {
      const endpoint =
        mode === "register"
          ? "/api/auth/register/send-code"
          : "/api/auth/password-reset/send-code";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "验证码发送失败。");
        return;
      }
      startCountdown();
      if (data.demoCode) {
        setDemoCode(data.demoCode);
        toast(`演示验证码：${data.demoCode}`, "info");
      } else {
        toast("验证码已发送至邮箱。", "success");
      }
    } catch {
      setError("验证码发送失败。");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "登录失败。");
          return;
        }
        toast("登录成功。", "success");
        onSuccess(data.user);
      } else if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            nickname,
            code,
            inviteCode: inviteCode || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "注册失败。");
          return;
        }
        toast("注册成功，赠送 3 张额度。", "success");
        onSuccess(data.user);
      } else {
        const res = await fetch("/api/auth/password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "重置密码失败。");
          return;
        }
        toast("密码已重置。", "success");
        onSuccess(data.user);
      }
    } catch {
      setError("请求失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(password);
  const titles: Record<AuthMode, string> = {
    login: "欢迎你的到来",
    register: "创建账号",
    reset: "找回密码",
  };

  return (
    <Dialog open={open} onClose={onClose} title={titles[mode]}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && <div className="auth-alert-error">{error}</div>}
        {demoCode && mode !== "login" && (
          <div className="auth-alert-success">
            演示验证码：<strong>{demoCode}</strong>
          </div>
        )}

        {mode === "register" && (
          <div className="auth-field">
            <label className="auth-helper">昵称（用于头像和任务列表展示）</label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: "0.625rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-foreground)",
                }}
              />
              <input
                className="auth-input"
                style={{ paddingLeft: "2rem" }}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
                maxLength={30}
                required
              />
            </div>
          </div>
        )}

        <div className="auth-field">
          <label className="auth-helper">邮箱</label>
          <div style={{ position: "relative" }}>
            <Mail
              size={16}
              style={{
                position: "absolute",
                left: "0.625rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted-foreground)",
              }}
            />
            <input
              className="auth-input"
              style={{ paddingLeft: "2rem" }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@qq.com / name@gmail.com"
              required
            />
          </div>
        </div>

        {mode !== "login" && (
          <div className="auth-field">
            <label className="auth-helper">邮箱验证码</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <KeyRound
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.625rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted-foreground)",
                  }}
                />
                <input
                  className="auth-input"
                  style={{ paddingLeft: "2rem" }}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6 位验证码"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              <button
                type="button"
                className="task-button task-button-secondary"
                onClick={handleSendCode}
                disabled={countdown > 0}
                style={{ whiteSpace: "nowrap" }}
              >
                {countdown > 0 ? `${countdown}s` : "发送验证码"}
              </button>
            </div>
          </div>
        )}

        <div className="auth-field">
          <label className="auth-helper">
            {mode === "reset" ? "新密码" : "密码"}
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={16}
              style={{
                position: "absolute",
                left: "0.625rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted-foreground)",
              }}
            />
            <input
              className="auth-input"
              style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位，包含字母和数字"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "0.625rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted-foreground)",
                padding: 0,
                display: "flex",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {mode === "register" && password && (
            <div className="auth-helper">
              密码强度：
              <span
                style={{
                  color:
                    pwStrength.score >= 3
                      ? "var(--status-completed)"
                      : pwStrength.score >= 2
                        ? "var(--status-running)"
                        : "var(--danger)",
                }}
              >
                {pwStrength.label}
              </span>
            </div>
          )}
        </div>

        {mode === "register" && (
          <div className="auth-field">
            <label className="auth-helper">邀请码（选填）</label>
            <div style={{ position: "relative" }}>
              <Gift
                size={16}
                style={{
                  position: "absolute",
                  left: "0.625rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-foreground)",
                }}
              />
              <input
                className="auth-input"
                style={{ paddingLeft: "2rem" }}
                value={inviteCode}
                onChange={(e) =>
                  setInviteCode(e.target.value.toUpperCase().slice(0, 16))
                }
                placeholder="选填"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
          style={{ marginTop: "0.25rem" }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              提交中...
            </>
          ) : mode === "login" ? (
            "登录"
          ) : mode === "register" ? (
            "注册"
          ) : (
            "重置密码并登录"
          )}
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8125rem",
          }}
        >
          {mode === "login" ? (
            <>
              <span className="auth-link" onClick={() => setMode("reset")}>
                忘记密码？
              </span>
              <span>
                还没有账号？
              </span>
            </>
          ) : (
            <span className="auth-link" onClick={() => setMode("login")}>
              {mode === "register" ? "已有账号？登录" : "想起密码？登录"}
            </span>
          )}
          {mode === "login" && (
            <span
              className="auth-link"
              onClick={() => setMode("register")}
              style={{ fontWeight: 500 }}
            >
              注册账号
            </span>
          )}
        </div>
      </form>
    </Dialog>
  );
}
