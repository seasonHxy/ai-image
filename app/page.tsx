"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { Sidebar } from "@/components/Sidebar";
import { Workspace } from "@/components/Workspace";
import { CreditsDialog } from "@/components/dialogs/CreditsDialog";
import { InviteDialog } from "@/components/dialogs/InviteDialog";
import { FeedbackDialog } from "@/components/dialogs/FeedbackDialog";
import { ChangePasswordDialog } from "@/components/dialogs/ChangePasswordDialog";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import type { Topic, Message, PublicUser } from "@/lib/types";
import { Loader2, Sparkles } from "lucide-react";

type TopicWithMessages = Topic & { messages?: Message[] };

function AppContent() {
  const { toast } = useToast();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<TopicWithMessages | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>("");

  const [creditsOpen, setCreditsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const currentTopicIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentTopicIdRef.current = currentTopicId;
  }, [currentTopicId]);

  const selectTopic = useCallback(async (id: string) => {
    setCurrentTopicId(id);
    try {
      const res = await fetch(`/api/topics/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setCurrentTopic(data.topic);
    } catch {
      // ignore
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/topics");
      if (!res.ok) return;
      const data = await res.json();
      setTopics(data.topics || []);
      if (data.topics?.length > 0 && !currentTopicIdRef.current) {
        selectTopic(data.topics[0].id);
      }
    } catch {
      // ignore
    }
  }, [selectTopic]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          await fetchTopics();
        }
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  }, [fetchTopics]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (invite) setInviteCode(invite);

    const checkout = params.get("checkout");
    if (checkout === "success") {
      setTimeout(() => {
        toast("支付已提交，到账可能需要几秒钟。若余额未更新，请稍后刷新。", "info");
      }, 500);
    } else if (checkout === "cancel") {
      setTimeout(() => {
        toast("支付已取消，未扣款也未充值。", "info");
      }, 500);
    }

    const authError = params.get("authError");
    if (authError) {
      toast("Google 登录失败，请重试或使用登录表单。", "error");
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, [checkAuth]);

  const handleNewTask = async () => {
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "新任务" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "创建任务失败。", "error");
        return;
      }
      setTopics((prev) => [data.topic, ...prev]);
      setCurrentTopicId(data.topic.id);
      setCurrentTopic({ ...data.topic, messages: [] });
    } catch {
      toast("创建任务失败。", "error");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      const res = await fetch(`/api/topics/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("删除失败。", "error");
        return;
      }
      setTopics((prev) => prev.filter((t) => t.id !== id));
      if (currentTopicId === id) {
        const remaining = topics.filter((t) => t.id !== id);
        if (remaining.length > 0) {
          selectTopic(remaining[0].id);
        } else {
          setCurrentTopicId(null);
          setCurrentTopic(null);
        }
      }
      toast("任务已删除。", "success");
    } catch {
      toast("删除失败。", "error");
    }
  };

  const handleRenameTopic = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("重命名失败。", "error");
        return;
      }
      setTopics((prev) =>
        prev.map((t) => (t.id === id ? data.topic : t))
      );
      if (currentTopicId === id) {
        setCurrentTopic((prev) => (prev ? { ...prev, title } : prev));
      }
    } catch {
      toast("重命名失败。", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setTopics([]);
      setCurrentTopicId(null);
      setCurrentTopic(null);
      toast("已退出登录。", "info");
    } catch {
      toast("退出失败。", "error");
    }
  };

  const handleTopicUpdate = useCallback((updatedTopic: TopicWithMessages) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === updatedTopic.id ? { ...t, ...updatedTopic } : t))
    );
    setCurrentTopic((prev) =>
      prev?.id === updatedTopic.id ? { ...prev, ...updatedTopic } : prev
    );
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        <Sparkles size={20} style={{ color: "var(--accent)" }} />
        Loading AI 图片生成
        <Loader2 size={16} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSuccess={(u: PublicUser) => {
          setUser(u);
          fetchTopics();
        }}
        inviteCode={inviteCode}
      />
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      <Sidebar
        user={user}
        topics={topics}
        currentTopicId={currentTopicId}
        onSelectTopic={selectTopic}
        onNewTask={handleNewTask}
        onDeleteTopic={handleDeleteTopic}
        onRenameTopic={handleRenameTopic}
        onLogout={handleLogout}
        onOpenCredits={() => setCreditsOpen(true)}
        onOpenInvite={() => setInviteOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <Workspace
        user={user}
        topic={currentTopic}
        onUserUpdate={setUser}
        onTopicUpdate={handleTopicUpdate}
        onMobileMenuToggle={() => setMobileSidebarOpen(true)}
      />

      <CreditsDialog
        open={creditsOpen}
        onClose={() => setCreditsOpen(false)}
        user={user}
        onUserUpdate={setUser}
      />
      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        user={user}
      />
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
