"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Sparkles, Package, X } from "lucide-react";
import { ImageGenerator, ReferenceImageItem } from "./ImageGenerator";
import { CanvasHistory } from "./CanvasHistory";
import { PresetTemplates } from "./PresetTemplates";
import { Lightbox, useLightbox } from "./Lightbox";
import type { Topic, Message, GeneratedImage, PublicUser } from "@/lib/types";
import { PRESET_TEMPLATES } from "@/lib/presets";
import { sanitizeFilename } from "@/lib/utils";
import { useToast } from "./ui/Toast";

type TopicWithMessages = Topic & { messages?: Message[] };

interface WorkspaceProps {
  user: PublicUser | null;
  topic: TopicWithMessages | null;
  onUserUpdate: (user: PublicUser) => void;
  onTopicUpdate: (topic: TopicWithMessages) => void;
  onMobileMenuToggle: () => void;
}

export function Workspace({
  user,
  topic,
  onUserUpdate,
  onTopicUpdate,
  onMobileMenuToggle,
}: WorkspaceProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(1);
  const [size, setSize] = useState("1024x1024");
  const [referenceImages, setReferenceImages] = useState<ReferenceImageItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const topicRef = useRef<TopicWithMessages | null>(null);
  const onTopicUpdateRef = useRef(onTopicUpdate);

  useEffect(() => {
    topicRef.current = topic;
    onTopicUpdateRef.current = onTopicUpdate;
  }, [topic, onTopicUpdate]);

  const lightbox = useLightbox();

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    const currentTopic = topicRef.current;
    if (!currentTopic) return;
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/topics/${currentTopic.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.topic) {
          setMessages(data.topic.messages || []);
          onTopicUpdateRef.current(data.topic);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);
  }, [stopPolling]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(topic?.messages || []);
  }, [topic?.id, topic]);

  useEffect(() => {
    const hasRunning = messages.some(
      (m) => m.status === "running" || m.status === "pending" || m.status === "cancel_requested"
    );
    if (hasRunning) {
      startPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [messages, startPolling, stopPolling]);

  const addReferenceFiles = (files: File[]) => {
    setReferenceImages((prev) => {
      const remaining = 8 - prev.length;
      if (remaining <= 0) {
        toast("最多只能添加 8 张参考图。", "error");
        return prev;
      }
      const toAdd = files.slice(0, remaining);
      if (files.length > remaining) {
        toast(`最多只能添加 8 张参考图，已保留前 8 张。`, "error");
      }
      const newItems = toAdd.map((file, i) => ({
        id: `refq_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        label: `参考图${prev.length + i + 1}`,
      }));
      if (toAdd.length > 0) {
        toast(`已添加 ${toAdd.length} 张参考图。`, "success");
      }
      return [...prev, ...newItems];
    });
  };

  const removeReference = (id: string) => {
    setReferenceImages((prev) => {
      const item = prev.find((r) => r.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((r) => r.id !== id);
    });
  };

  const addGeneratedAsReference = async (image: GeneratedImage) => {
    try {
      const res = await fetch(image.imageData);
      const blob = await res.blob();
      const file = new File([blob], `generated-${image.serial}.png`, {
        type: blob.type || "image/png",
      });
      addReferenceFiles([file]);
      toast(`已将 #${image.serial} 加入参考图，可在提示词中直接引用这个编号。`, "success");
    } catch {
      toast("无法读取图片。", "error");
    }
  };

  const handleGenerate = async () => {
    if (!topic) return;
    if (!prompt.trim()) {
      toast("请输入提示词。", "error");
      return;
    }
    if (!user || count > user.credits) {
      toast(`额度不足，当前余额 ${user?.credits ?? 0} 张。`, "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("prompt", prompt.trim());
      formData.append("count", String(count));
      formData.append("size", size);
      formData.append("topicId", topic.id);

      for (const ref of referenceImages) {
        formData.append("referenceImages", ref.file);
        formData.append("referenceImageLabels", ref.label);
      }

      const res = await fetch("/api/generate-images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "生成失败。", "error");
        return;
      }

      if (data.user) onUserUpdate(data.user);
      if (data.topic) onTopicUpdate(data.topic);
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
      setPrompt("");
    } catch {
      toast("生成失败。", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (messageId: string) => {
    if (!confirm("确认取消当前生成任务？取消后会停止后台生成，未完成的张数会在任务结束时退回。")) {
      return;
    }
    try {
      const res = await fetch(`/api/tasks/${messageId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "取消失败。", "error");
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, status: "cancel_requested" } : m
        )
      );
    } catch {
      toast("取消失败。", "error");
    }
  };

  const handleRetry = async (messageId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${messageId}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "重试失败。", "error");
        return;
      }
      if (data.user) onUserUpdate(data.user);
      if (data.topic) onTopicUpdate(data.topic);
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      toast("重试失败。", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (images: GeneratedImage[], index: number) => {
    lightbox.open(
      images.map((img) => ({ src: img.imageData, alt: img.prompt })),
      index
    );
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) {
      toast("请先选择要导出的画布图片。", "error");
      return;
    }

    toast("导出中...", "info");

    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      let exportIndex = 0;
      for (const msg of messages) {
        for (const img of msg.images) {
          if (selectedIds.has(img.id)) {
            try {
              const res = await fetch(img.imageData);
              const blob = await res.blob();
              const ext = blob.type === "image/jpeg" ? "jpg" : "png";
              zip.file(
                `${sanitizeFilename(msg.prompt)}-generated-${img.serial}.${ext}`,
                blob
              );
              exportIndex++;
            } catch {
              // skip failed images
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(topic?.title || "canvas")}-export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast(`已导出 ${exportIndex} 张画布图片。`, "success");
      setExportMode(false);
      setSelectedIds(new Set());
    } catch {
      toast("导出失败。", "error");
    }
  };

  const handlePresetSelect = (preset: (typeof PRESET_TEMPLATES)[0]) => {
    setPrompt(preset.prompt);
    setCount(preset.count);
    setSize(preset.size);
    toast("已应用模板，点击后会写入提示词、张数和尺寸。", "info");
  };

  const isRunning = messages.some(
    (m) => m.status === "running" || m.status === "pending" || m.status === "cancel_requested"
  );

  const hasMessages = messages.length > 0;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
        marginLeft: 0,
      }}
      className="lg:ml-64"
    >
      {/* Top Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.625rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={onMobileMenuToggle}
            className="task-button task-button-ghost lg:hidden"
            style={{ padding: "0.25rem" }}
          >
            <Menu size={20} />
          </button>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
            {topic?.title || "未选择任务"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {hasMessages && (
            <button
              className="task-button task-button-ghost"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem" }}
              onClick={() => {
                setExportMode(!exportMode);
                setSelectedIds(new Set());
              }}
            >
              {exportMode ? (
                <>
                  <X size={12} />
                  取消选择
                </>
              ) : (
                <>
                  <Package size={12} />
                  批量导出
                </>
              )}
            </button>
          )}
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
            }}
          >
            余额 {user?.credits ?? 0} 张
          </span>
        </div>
      </header>

      {/* Running Banner */}
      {isRunning && (
        <div
          style={{
            padding: "0.5rem 1rem",
            background: "color-mix(in srgb, var(--status-running) 10%, transparent)",
            borderBottom: "1px solid var(--border)",
            fontSize: "0.75rem",
            color: "var(--status-running)",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          <Sparkles size={12} className="animate-pulse" />
          任务运行中 — 当前任务正在运行，完成或取消前不能继续提交。关闭页面不会取消任务，后台会继续运行。
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "48rem",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {!hasMessages && (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 0",
              }}
            >
              <Sparkles
                size={32}
                style={{
                  color: "var(--accent)",
                  marginBottom: "0.75rem",
                }}
              />
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "0.375rem",
                }}
              >
                选择一个模板，开始批量生成
              </h2>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted-foreground)",
                  marginBottom: "1.5rem",
                }}
              >
                也可以直接在下方输入自己的想法直接开始
              </p>
              <PresetTemplates onSelect={handlePresetSelect} compact />
            </div>
          )}

          <CanvasHistory
            messages={messages}
            onImageClick={handleImageClick}
            onAddReference={addGeneratedAsReference}
            onCancelTask={handleCancel}
            onRetryTask={handleRetry}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onExport={handleExport}
            exportMode={exportMode}
          />
        </div>
      </div>

      {/* Image Generator */}
      <ImageGenerator
        prompt={prompt}
        setPrompt={setPrompt}
        count={count}
        setCount={setCount}
        size={size}
        setSize={setSize}
        referenceImages={referenceImages}
        onAddReferenceFiles={addReferenceFiles}
        onRemoveReference={removeReference}
        onSubmit={handleGenerate}
        loading={loading}
        disabled={isRunning}
        credits={user?.credits ?? 0}
      />

      <Lightbox state={lightbox.state} onClose={lightbox.close} />
    </div>
  );
}
