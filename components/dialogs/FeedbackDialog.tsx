"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Dialog } from "../ui/Dialog";
import { useToast } from "../ui/Toast";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast("请输入反馈内容。", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "提交反馈失败。", "error");
        return;
      }
      toast("反馈已提交，感谢你的支持！", "success");
      setContent("");
      onClose();
    } catch {
      toast("提交反馈失败。", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="提交反馈">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="task-field">
          <label className="task-field-label">反馈内容（最多 2000 字）</label>
          <textarea
            className="task-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 2000))}
            placeholder="请输入你的意见、建议或遇到的问题..."
            rows={5}
          />
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: "0.75rem",
            color: "var(--muted-foreground)",
          }}
        >
          {content.length} / 2000
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
              提交中...
            </>
          ) : (
            <>
              <Send size={14} />
              提交反馈
            </>
          )}
        </button>
      </div>
    </Dialog>
  );
}
