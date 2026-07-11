"use client";

import { useState } from "react";
import { CreditCard, Loader2, ExternalLink, Ticket } from "lucide-react";
import { Dialog } from "../ui/Dialog";
import { useToast } from "../ui/Toast";
import type { PublicUser } from "@/lib/types";

interface CreditsDialogProps {
  open: boolean;
  onClose: () => void;
  user: PublicUser | null;
  onUserUpdate: (user: PublicUser) => void;
}

export function CreditsDialog({
  open,
  onClose,
  user,
  onUserUpdate,
}: CreditsDialogProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast("请输入卡券 CDK。", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "兑换失败。", "error");
        return;
      }
      toast(`已充值 ${data.credits} 张额度。`, "success");
      onUserUpdate(data.user);
      setCode("");
      onClose();
    } catch {
      toast("兑换失败。", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="充值额度">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "var(--muted)",
            borderRadius: "var(--radius)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>
            当前余额
          </span>
          <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
            {user?.credits ?? 0} 张
          </span>
        </div>

        <div className="task-field">
          <label className="task-field-label">卡券 CDK</label>
          <div style={{ position: "relative" }}>
            <Ticket
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
              className="task-text-input"
              style={{ paddingLeft: "2rem" }}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PX-XXXX-XXXX-XXXX-XXXX"
            />
          </div>
        </div>

        <p className="auth-helper">
          购买卡券后输入 CDK，即可充值图片额度。测试卡券：
          <br />
          <code style={{ fontSize: "0.75rem", color: "var(--accent)" }}>
            PX-TEST-0001-CRED-0010
          </code>
          （10 张）
        </p>

        <a
          href="https://example.com/buy-imagegoai-credits"
          target="_blank"
          rel="noopener noreferrer"
          className="task-button task-button-secondary"
          style={{ width: "100%" }}
        >
          <ExternalLink size={14} />
          跳转到卡网购买
        </a>
      </div>

      <div className="task-dialog-actions">
        <button className="task-button task-button-ghost" onClick={onClose}>
          取消
        </button>
        <button
          className="task-button task-button-primary"
          onClick={handleRedeem}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              充值中...
            </>
          ) : (
            <>
              <CreditCard size={14} />
              确认充值
            </>
          )}
        </button>
      </div>
    </Dialog>
  );
}
