"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {t.type === "success" && (
              <CheckCircle2
                size={16}
                style={{ color: "var(--status-completed)", flexShrink: 0 }}
              />
            )}
            {t.type === "error" && (
              <XCircle
                size={16}
                style={{ color: "var(--danger)", flexShrink: 0 }}
              />
            )}
            {t.type === "info" && (
              <Info
                size={16}
                style={{ color: "var(--accent)", flexShrink: 0 }}
              />
            )}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted-foreground)",
                padding: 0,
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
