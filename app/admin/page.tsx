"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Ticket,
  Users,
  MessageSquare,
  LogOut,
  Plus,
  Trash2,
  Copy,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

type Tab = "stats" | "cdks" | "users" | "feedbacks";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [cdks, setCdks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [newCdkCredits, setNewCdkCredits] = useState(10);
  const [newCdkCount, setNewCdkCount] = useState(1);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_key");
    if (saved) {
      setKey(saved);
      setAuthed(true);
    }
  }, []);

  const api = useCallback(
    async (path: string, options?: RequestInit) => {
      const res = await fetch(path, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: `Bearer ${key}`,
        },
      });
      return res;
    },
    [key]
  );

  const loadData = useCallback(
    async (which: Tab) => {
      if (which === "stats") {
        const res = await api("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } else if (which === "cdks") {
        const res = await api("/api/admin/cdks");
        if (res.ok) {
          const data = await res.json();
          setCdks(data.cdks);
        }
      } else if (which === "users") {
        const res = await api("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } else if (which === "feedbacks") {
        const res = await api("/api/admin/feedbacks");
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data.feedbacks);
        }
      }
    },
    [api]
  );

  useEffect(() => {
    if (authed) loadData(tab);
  }, [authed, tab, loadData]);

  const handleLogin = () => {
    if (!key.trim()) return;
    localStorage.setItem("admin_key", key.trim());
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_key");
    setKey("");
    setAuthed(false);
  };

  const handleCreateCdk = async () => {
    setCreating(true);
    try {
      const res = await api("/api/admin/cdks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: newCdkCredits, count: newCdkCount }),
      });
      if (res.ok) {
        loadData("cdks");
      }
    } catch {
      // ignore
    }
    setCreating(false);
  };

  const handleDeleteCdk = async (code: string) => {
    if (!confirm(`确认删除卡券 ${code}？`)) return;
    await api(`/api/admin/cdks?code=${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
    loadData("cdks");
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "24rem",
            padding: "2rem",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius) * 1.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <Sparkles size={24} style={{ color: "var(--accent)" }} />
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              管理后台
            </h1>
          </div>
          <div className="task-field">
            <label className="task-field-label">管理密钥</label>
            <div style={{ position: "relative" }}>
              <input
                className="task-text-input"
                style={{ paddingRight: "2.5rem" }}
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="请输入 ADMIN_KEY"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute",
                  right: "0.625rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted-foreground)",
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            className="task-button task-button-primary"
            onClick={handleLogin}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            进入后台
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "stats", label: "概览", icon: LayoutDashboard },
    { id: "cdks", label: "卡券", icon: Ticket },
    { id: "users", label: "用户", icon: Users },
    { id: "feedbacks", label: "反馈", icon: MessageSquare },
  ];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--background)",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "14rem",
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
          padding: "1rem 0.75rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0 0.625rem",
            marginBottom: "1.5rem",
          }}
        >
          <Sparkles size={20} style={{ color: "var(--accent)" }} />
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>管理后台</span>
        </div>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius)",
              border: "none",
              background: tab === t.id ? "var(--secondary-button)" : "transparent",
              color: "var(--foreground)",
              fontSize: "0.8125rem",
              fontWeight: tab === t.id ? 600 : 400,
              cursor: "pointer",
              marginBottom: "0.125rem",
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={handleLogout}
          className="task-button task-button-ghost"
          style={{ width: "100%", justifyContent: "flex-start" }}
        >
          <LogOut size={14} />
          退出
        </button>
      </aside>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: "1.5rem",
          overflowY: "auto",
          maxHeight: "100dvh",
        }}
      >
        {tab === "stats" && (
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
              平台概览
            </h2>
            {stats ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "1rem",
                }}
              >
                <StatCard label="注册用户" value={stats.users} />
                <StatCard label="任务数" value={stats.topics} />
                <StatCard label="生成次数" value={stats.messages} />
                <StatCard label="卡券总数" value={stats.cdks} />
                <StatCard label="已兑换卡券" value={stats.redeemedCdks} />
                <StatCard label="用户反馈" value={stats.feedbacks} />
                <StatCard label="用户总额度" value={stats.totalCredits} />
              </div>
            ) : (
              <p style={{ color: "var(--muted-foreground)" }}>加载中...</p>
            )}
          </div>
        )}

        {tab === "cdks" && (
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
              卡券管理
            </h2>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1rem",
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div className="task-field">
                <label className="task-field-label">额度</label>
                <input
                  type="number"
                  className="task-text-input"
                  style={{ width: "6rem" }}
                  value={newCdkCredits}
                  onChange={(e) => setNewCdkCredits(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
              <div className="task-field">
                <label className="task-field-label">数量</label>
                <input
                  type="number"
                  className="task-text-input"
                  style={{ width: "6rem" }}
                  value={newCdkCount}
                  onChange={(e) => setNewCdkCount(parseInt(e.target.value) || 1)}
                  min={1}
                  max={100}
                />
              </div>
              <button
                className="task-button task-button-primary"
                onClick={handleCreateCdk}
                disabled={creating}
              >
                {creating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={14} />
                    生成卡券
                  </>
                )}
              </button>
            </div>
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "calc(var(--radius) * 1.2)",
                overflow: "hidden",
              }}
            >
              {cdks.length === 0 ? (
                <p style={{ padding: "1rem", color: "var(--muted-foreground)" }}>
                  暂无卡券
                </p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.8125rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "var(--muted)",
                        textAlign: "left",
                      }}
                    >
                      <th style={{ padding: "0.5rem 0.75rem" }}>卡券代码</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>额度</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>状态</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>兑换人</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cdks.map((cdk: any) => (
                      <tr
                        key={cdk.code}
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace" }}>
                          {cdk.code}
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{cdk.credits}</td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>
                          {cdk.redeemedBy ? (
                            <span style={{ color: "var(--status-completed)" }}>已兑换</span>
                          ) : (
                            <span style={{ color: "var(--muted-foreground)" }}>未使用</span>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>
                          {cdk.redeemedBy ? cdk.redeemedBy.slice(0, 8) + "..." : "-"}
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            <button
                              onClick={() => copyText(cdk.code)}
                              title="复制"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--muted-foreground)",
                                padding: "0.25rem",
                              }}
                            >
                              <Copy size={14} />
                            </button>
                            {!cdk.redeemedBy && (
                              <button
                                onClick={() => handleDeleteCdk(cdk.code)}
                                title="删除"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "var(--danger)",
                                  padding: "0.25rem",
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
              用户列表
            </h2>
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "calc(var(--radius) * 1.2)",
                overflow: "hidden",
              }}
            >
              {users.length === 0 ? (
                <p style={{ padding: "1rem", color: "var(--muted-foreground)" }}>
                  暂无用户
                </p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.8125rem",
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                      <th style={{ padding: "0.5rem 0.75rem" }}>昵称</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>邮箱</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>额度</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>邀请码</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>邀请数</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>注册时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{u.nickname}</td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{u.email}</td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{u.credits}</td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace" }}>
                          {u.inviteCode}
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{u.invitedCount}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted-foreground)" }}>
                          {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "feedbacks" && (
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
              用户反馈
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {feedbacks.length === 0 ? (
                <p style={{ color: "var(--muted-foreground)" }}>暂无反馈</p>
              ) : (
                feedbacks.map((f: any) => (
                  <div
                    key={f.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "calc(var(--radius) * 1.2)",
                      padding: "1rem",
                      background: "var(--card)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                        {f.nickname}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>
                        {new Date(f.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8125rem", lineHeight: 1.6 }}>
                      {f.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "calc(var(--radius) * 1.2)",
        padding: "1.25rem",
        background: "var(--card)",
      }}
    >
      <div
        style={{
          fontSize: "0.6875rem",
          color: "var(--muted-foreground)",
          marginBottom: "0.375rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}
