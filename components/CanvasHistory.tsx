"use client";

import { useState } from "react";
import {
  Download,
  ImagePlus,
  Loader2,
  RotateCcw,
  Ban,
  CheckSquare,
  Square,
  Package,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Message, GeneratedImage } from "@/lib/types";
import { STATUS_LABELS, SIZE_LABELS } from "@/lib/types";
import { formatDateTime, formatDateTimeTitle, sanitizeFilename } from "@/lib/utils";

interface CanvasHistoryProps {
  messages: Message[];
  onImageClick: (images: GeneratedImage[], index: number) => void;
  onAddReference: (image: GeneratedImage) => void;
  onCancelTask: (messageId: string) => void;
  onRetryTask: (messageId: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onExport: () => void;
  exportMode: boolean;
}

export function CanvasHistory({
  messages,
  onImageClick,
  onAddReference,
  onCancelTask,
  onRetryTask,
  selectedIds,
  onToggleSelect,
  onExport,
  exportMode,
}: CanvasHistoryProps) {
  const [addedRefs, setAddedRefs] = useState<Set<string>>(new Set());

  const handleAddRef = (image: GeneratedImage) => {
    onAddReference(image);
    setAddedRefs((prev) => new Set(prev).add(image.id));
    setTimeout(() => {
      setAddedRefs((prev) => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    }, 2000);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {exportMode && selectedIds.size > 0 && (
        <div
          style={{
            position: "sticky",
            top: "0.5rem",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.625rem 1rem",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius) * 1.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
            已选择 {selectedIds.size} 张画布图片
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="task-button task-button-ghost" onClick={() => onExport()}>
              <Package size={14} />
              选择导出
            </button>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <CanvasMessage
          key={msg.id}
          message={msg}
          onImageClick={onImageClick}
          onAddReference={handleAddRef}
          addedRefs={addedRefs}
          onCancelTask={onCancelTask}
          onRetryTask={onRetryTask}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          exportMode={exportMode}
        />
      ))}
    </div>
  );
}

function CanvasMessage({
  message,
  onImageClick,
  onAddReference,
  addedRefs,
  onCancelTask,
  onRetryTask,
  selectedIds,
  onToggleSelect,
  exportMode,
}: {
  message: Message;
  onImageClick: (images: GeneratedImage[], index: number) => void;
  onAddReference: (image: GeneratedImage) => void;
  addedRefs: Set<string>;
  onCancelTask: (id: string) => void;
  onRetryTask: (id: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  exportMode: boolean;
}) {
  const isRunning = message.status === "running" || message.status === "pending";
  const isCanceling = message.status === "cancel_requested";
  const isFailed = message.status === "failed";
  const isCanceled = message.status === "canceled";

  const statusClass = `status-${message.status}`;

  return (
    <div className="canvas-history-item animate-fade-in">
      {/* Message Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span className={`status-badge ${statusClass}`}>
            {STATUS_LABELS[message.status] || "未知状态"}
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--muted-foreground)",
            }}
            title={formatDateTimeTitle(message.createdAt)}
          >
            {formatDateTime(message.createdAt)}
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--muted-foreground)",
            }}
          >
            · {message.count} 张 · {SIZE_LABELS[message.size] || message.size}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.375rem" }}>
          {(isRunning || isCanceling) && (
            <button
              className="task-button task-button-secondary"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem" }}
              onClick={() => onCancelTask(message.id)}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  正在停止
                </>
              ) : (
                <>
                  <Ban size={12} />
                  取消任务
                </>
              )}
            </button>
          )}
          {(isFailed || isCanceled) && (
            <button
              className="task-button task-button-secondary"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem" }}
              onClick={() => onRetryTask(message.id)}
            >
              <RotateCcw size={12} />
              重试
            </button>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div
        style={{
          padding: "0.75rem 1rem",
          fontSize: "0.8125rem",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.prompt}
      </div>

      {/* Reference Images */}
      {message.referenceImages.length > 0 && (
        <div
          style={{
            padding: "0 1rem 0.75rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {message.referenceImages.map((ref) => (
            <div
              key={ref.id}
              style={{
                position: "relative",
                width: "60px",
                height: "60px",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ref.imageData}
                alt={ref.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Generated Images */}
      <div
        style={{
          padding: "0 1rem 0.75rem",
        }}
      >
        {isRunning ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {Array.from({ length: message.count }).map((_, i) => (
              <div
                key={i}
                className="canvas-image-placeholder"
                style={{
                  aspectRatio: "1",
                  flexDirection: "column",
                  gap: "0.375rem",
                }}
              >
                <Loader2
                  size={20}
                  className="animate-spin"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <span style={{ fontSize: "0.625rem", color: "var(--muted-foreground)" }}>
                  #{i + 1} 生成中
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {message.images.map((img, index) => (
              <ImageCard
                key={img.id}
                image={img}
                index={index}
                allImages={message.images}
                onImageClick={onImageClick}
                onAddReference={onAddReference}
                added={addedRefs.has(img.id)}
                selected={selectedIds.has(img.id)}
                onToggleSelect={onToggleSelect}
                exportMode={exportMode}
              />
            ))}
          </div>
        )}

        {isCanceling && (
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <Clock size={12} />
            未完成的张数会在任务结束时退回。
          </div>
        )}

        {isCanceled && (
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
            }}
          >
            任务已取消，未完成的张数已退回。
          </div>
        )}

        {isFailed && (
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <AlertCircle size={12} />
            {message.error || "生成失败。"}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageCard({
  image,
  index,
  allImages,
  onImageClick,
  onAddReference,
  added,
  selected,
  onToggleSelect,
  exportMode,
}: {
  image: GeneratedImage;
  index: number;
  allImages: GeneratedImage[];
  onImageClick: (images: GeneratedImage[], index: number) => void;
  onAddReference: (image: GeneratedImage) => void;
  added: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  exportMode: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = image.imageData;
    a.download = `${sanitizeFilename(image.prompt)}-generated-${image.indexInMessage + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: selected ? "2px solid var(--accent)" : "1px solid var(--border)",
        cursor: "pointer",
        background: "var(--canvas-muted)",
      }}
      onClick={() => {
        if (exportMode) {
          onToggleSelect(image.id);
        } else {
          onImageClick(allImages, index);
        }
      }}
    >
      {!loaded && (
        <div
          className="canvas-image-placeholder"
          style={{ position: "absolute", inset: 0 }}
        >
          <Loader2
            size={16}
            className="animate-spin"
            style={{ color: "var(--muted-foreground)" }}
          />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.imageData}
        alt={`${image.prompt} #${image.serial}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s",
        }}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />

      {/* Serial badge */}
      <span
        style={{
          position: "absolute",
          top: "0.25rem",
          left: "0.25rem",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          fontSize: "0.625rem",
          padding: "0.0625rem 0.3125rem",
          borderRadius: "0.25rem",
          pointerEvents: "none",
        }}
      >
        #{image.serial}
      </span>

      {/* Export checkbox */}
      {exportMode && (
        <div
          style={{
            position: "absolute",
            top: "0.25rem",
            right: "0.25rem",
            pointerEvents: "none",
          }}
        >
          {selected ? (
            <CheckSquare size={18} style={{ color: "var(--accent)" }} />
          ) : (
            <Square size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
          )}
        </div>
      )}

      {/* Hover actions */}
      {!exportMode && loaded && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0.375rem",
            display: "flex",
            gap: "0.25rem",
            justifyContent: "flex-end",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            opacity: 0,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <button
            onClick={handleDownload}
            title="下载"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "0.25rem",
              padding: "0.25rem",
              cursor: "pointer",
              color: "white",
              display: "flex",
              backdropFilter: "blur(4px)",
            }}
          >
            <Download size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddReference(image);
            }}
            title={added ? "已加入参考图" : "加入参考"}
            disabled={added}
            style={{
              background: added ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "0.25rem",
              padding: "0.25rem",
              cursor: added ? "default" : "pointer",
              color: "white",
              display: "flex",
              backdropFilter: "blur(4px)",
            }}
          >
            {added ? <CheckSquare size={12} /> : <ImagePlus size={12} />}
          </button>
        </div>
      )}
    </div>
  );
}
