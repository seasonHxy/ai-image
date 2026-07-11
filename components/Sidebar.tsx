"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Gift,
  LogOut,
  KeyRound,
  CreditCard,
  X,
  ChevronDown,
} from "lucide-react";
import type { Topic, PublicUser } from "@/lib/types";

interface SidebarProps {
  user: PublicUser | null;
  topics: Topic[];
  currentTopicId: string | null;
  onSelectTopic: (id: string) => void;
  onNewTask: () => void;
  onDeleteTopic: (id: string) => void;
  onRenameTopic: (id: string, title: string) => void;
  onLogout: () => void;
  onOpenCredits: () => void;
  onOpenInvite: () => void;
  onOpenFeedback: () => void;
  onOpenChangePassword: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  user,
  topics,
  currentTopicId,
  onSelectTopic,
  onNewTask,
  onDeleteTopic,
  onRenameTopic,
  onLogout,
  onOpenCredits,
  onOpenInvite,
  onOpenFeedback,
  onOpenChangePassword,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const startRename = (topic: Topic) => {
    setEditingId(topic.id);
    setEditingTitle(topic.title);
  };

  const confirmRename = () => {
    if (editingId && editingTitle.trim()) {
      onRenameTopic(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 30,
          }}
          className="lg:hidden"
        />
      )}

      <aside
        style={{
          width: "16rem",
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 40,
          transition: "transform 0.2s",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="lg:translate-x-0"
      >
        {/* Header */}
        <div
          style={{
            padding: "0.875rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--sidebar-border)",
          }}
        >
          <div className="wordmark" style={{ fontSize: "1rem" }}>
            <Sparkles size={18} style={{ color: "var(--accent)" }} />
            <span>AI 图片生成</span>
          </div>
          <button
            onClick={onMobileClose}
            className="task-button task-button-ghost lg:hidden"
            style={{ padding: "0.25rem" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* New Task */}
        <div style={{ padding: "0.75rem" }}>
          <button
            className="task-button task-button-primary"
            onClick={onNewTask}
            style={{ width: "100%" }}
          >
            <Plus size={16} />
            新任务
          </button>
        </div>

        {/* Task List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 0.5rem",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.5rem 0.25rem",
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            任务
          </div>
          {topics.length === 0 ? (
            <div
              style={{
                padding: "1rem 0.5rem",
                fontSize: "0.75rem",
                color: "var(--muted-foreground)",
                textAlign: "center",
              }}
            >
              暂无任务，点击上方创建
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => {
                  onSelectTopic(topic.id);
                  onMobileClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.625rem",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  background:
                    currentTopicId === topic.id
                      ? "var(--secondary-button)"
                      : "transparent",
                  marginBottom: "0.125rem",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (currentTopicId !== topic.id)
                    e.currentTarget.style.background = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  if (currentTopicId !== topic.id)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <MessageSquare
                  size={14}
                  style={{
                    color: "var(--muted-foreground)",
                    flexShrink: 0,
                  }}
                />
                {editingId === topic.id ? (
                  <input
                    autoFocus
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={confirmRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="task-text-input"
                    style={{
                      fontSize: "0.8125rem",
                      padding: "0.125rem 0.375rem",
                      flex: 1,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontSize: "0.8125rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {topic.title}
                  </span>
                )}
                {editingId !== topic.id && (
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(topic);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted-foreground)",
                        padding: "0.125rem",
                        display: "flex",
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
                {editingId !== topic.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("删除后会移除这个任务下的提示词和生成图片。")) {
                        onDeleteTopic(topic.id);
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted-foreground)",
                      padding: "0.125rem",
                      display: "flex",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Account */}
        <div
          ref={menuRef}
          style={{
            borderTop: "1px solid var(--sidebar-border)",
            padding: "0.625rem",
            position: "relative",
          }}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.625rem",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--muted)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--accent)",
                color: "var(--accent-foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {user?.nickname?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.nickname || "用户"}
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--muted-foreground)",
                }}
              >
                余额 {user?.credits ?? 0} 张
              </div>
            </div>
            <ChevronDown
              size={14}
              style={{
                color: "var(--muted-foreground)",
                transform: menuOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s",
              }}
            />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: "0.625rem",
                right: "0.625rem",
                marginBottom: "0.25rem",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              <MenuItem
                icon={CreditCard}
                label="充值额度"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCredits();
                }}
              />
              <MenuItem
                icon={Gift}
                label="邀请好友（获得额度）"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenInvite();
                }}
              />
              <MenuItem
                icon={MessageSquare}
                label="提交反馈"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenFeedback();
                }}
              />
              <MenuItem
                icon={KeyRound}
                label="修改密码"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenChangePassword();
                }}
              />
              <div
                style={{
                  height: "1px",
                  background: "var(--border)",
                  margin: "0 0.5rem",
                }}
              />
              <MenuItem
                icon={LogOut}
                label="退出登录"
                onClick={onLogout}
                danger
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.75rem",
        fontSize: "0.8125rem",
        cursor: "pointer",
        background: "transparent",
        border: "none",
        color: danger ? "var(--danger)" : "var(--foreground)",
        transition: "background 0.1s",
        textAlign: "left",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--muted)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
