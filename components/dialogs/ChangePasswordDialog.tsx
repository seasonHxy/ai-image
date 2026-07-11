"use client";

import { useState } from "react";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { Dialog } from "../ui/Dialog";
import { useToast } from "../ui/Toast";
import { getPasswordStrength } from "@/lib/auth";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwStrength = getPasswordStrength(newPassword);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("请填写所有字段。", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("两次输入的新密码不一致。", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, password: newPassword, passwordConfirm: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "修改密码失败。", "error");
        return;
      }
      toast("密码已修改。", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch {
      toast("修改密码失败。", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="修改密码">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="task-field">
          <label className="task-field-label">当前密码</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              className="task-text-input"
              style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="请输入当前密码"
            />
          </div>
        </div>

        <div className="task-field">
          <label className="task-field-label">新密码</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              className="task-text-input"
              style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少 8 位，包含字母和数字"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "0.625rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 0, display: "flex" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {newPassword && (
            <div className="auth-helper">
              密码强度：
              <span style={{ color: pwStrength.score >= 3 ? "var(--status-completed)" : pwStrength.score >= 2 ? "var(--status-running)" : "var(--danger)" }}>
                {pwStrength.label}
              </span>
            </div>
          )}
        </div>

        <div className="task-field">
          <label className="task-field-label">确认新密码</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              className="task-text-input"
              style={{ paddingLeft: "2rem" }}
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
            />
          </div>
        </div>
      </div>

      <div className="task-dialog-actions">
        <button className="task-button task-button-ghost" onClick={onClose}>
          取消
        </button>
        <button
          className="task-button task-button-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              保存中...
            </>
          ) : (
            "确认修改"
          )}
        </button>
      </div>
    </Dialog>
  );
}
