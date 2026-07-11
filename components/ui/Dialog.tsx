"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="task-dialog-backdrop animate-fade-in" onClick={onClose}>
      <div className="task-dialog-scrim" />
      <div
        className="task-dialog-panel"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="task-dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="task-dialog-title">{title}</h2>
            <button
              onClick={onClose}
              className="task-button task-button-ghost"
              style={{ padding: "0.25rem" }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="task-dialog-form">{children}</div>
        {actions && <div className="task-dialog-actions">{actions}</div>}
      </div>
    </div>
  );
}
