"use client";

import { useState } from "react";
import { Gift, Copy, Users } from "lucide-react";
import { Dialog } from "../ui/Dialog";
import { useToast } from "../ui/Toast";
import { MAX_INVITE_REWARDS, type PublicUser } from "@/lib/types";

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  user: PublicUser | null;
}

export function InviteDialog({ open, onClose, user }: InviteDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}?invite=${user?.inviteCode || ""}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast("邀请链接已复制。", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("复制失败，请手动复制。", "error");
    }
  };

  const invitedCount = Math.min(user?.invitedCount ?? 0, MAX_INVITE_REWARDS);

  return (
    <Dialog open={open} onClose={onClose} title="邀请好友（获得额度）">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div
          style={{
            padding: "0.75rem 1rem",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, #a855f7 15%, transparent))",
            borderRadius: "var(--radius)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Gift size={24} style={{ color: "var(--accent)" }} />
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              好友通过你的链接注册成功后，你获得 3 张额度
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--muted-foreground)",
                marginTop: "0.125rem",
              }}
            >
              最多奖励 {MAX_INVITE_REWARDS} 人
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 0.875rem",
            background: "var(--muted)",
            borderRadius: "var(--radius)",
          }}
        >
          <Users size={16} style={{ color: "var(--muted-foreground)" }} />
          <span style={{ fontSize: "0.8125rem" }}>
            已邀请 {invitedCount} / {MAX_INVITE_REWARDS} 人
          </span>
        </div>

        <div className="task-field">
          <label className="task-field-label">邀请码</label>
          <input
            className="task-text-input"
            value={user?.inviteCode || ""}
            readOnly
            style={{ fontWeight: 600, letterSpacing: "0.05em" }}
          />
        </div>

        <div className="task-field">
          <label className="task-field-label">邀请链接</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              className="task-text-input"
              value={inviteLink}
              readOnly
              style={{ flex: 1, fontSize: "0.75rem" }}
            />
            <button
              className="task-button task-button-primary"
              onClick={handleCopy}
              style={{ whiteSpace: "nowrap" }}
            >
              <Copy size={14} />
              {copied ? "已复制" : "复制链接"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
