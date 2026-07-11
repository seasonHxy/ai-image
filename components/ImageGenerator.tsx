"use client";

import { useRef, useState, useCallback } from "react";
import {
  ImagePlus,
  Loader2,
  Sparkles,
  X,
  Upload,
  Clipboard,
} from "lucide-react";
import { SIZES, SIZE_LABELS, MAX_REFERENCE_IMAGES, MAX_GENERATE_COUNT } from "@/lib/types";

export interface ReferenceImageItem {
  id: string;
  file: File;
  preview: string;
  label: string;
}

interface ImageGeneratorProps {
  prompt: string;
  setPrompt: (value: string) => void;
  count: number;
  setCount: (value: number) => void;
  size: string;
  setSize: (value: string) => void;
  referenceImages: ReferenceImageItem[];
  onAddReferenceFiles: (files: File[]) => void;
  onRemoveReference: (id: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
  credits: number;
}

export function ImageGenerator({
  prompt,
  setPrompt,
  count,
  setCount,
  size,
  setSize,
  referenceImages,
  onAddReferenceFiles,
  onRemoveReference,
  onSubmit,
  loading,
  disabled,
  credits,
}: ImageGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [composing, setComposing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length > 0) {
      onAddReferenceFiles(files);
    }
    e.target.value = "";
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      const imageFiles = items
        .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);

      if (imageFiles.length > 0) {
        onAddReferenceFiles(imageFiles);
      }
    },
    [onAddReferenceFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) {
        onAddReferenceFiles(files);
      }
    },
    [onAddReferenceFiles]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !composing) {
      e.preventDefault();
      if (!disabled && prompt.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--card)",
        padding: "1rem",
        paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div
        style={{
          maxWidth: "48rem",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Reference Images Preview */}
        {referenceImages.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {referenceImages.map((ref) => (
              <div
                key={ref.id}
                style={{
                  position: "relative",
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ref.preview}
                  alt={ref.label}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => onRemoveReference(ref.id)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    borderRadius: "0 0 0 0.25rem",
                    padding: "0.125rem",
                    cursor: "pointer",
                    color: "white",
                    display: "flex",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Prompt Input */}
        <div style={{ position: "relative" }}>
          <textarea
            className="task-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onPaste={handlePaste}
            placeholder="描述你要生成的图片，或选择上方模板快速开始"
            rows={3}
            style={{
              minHeight: "72px",
              paddingRight: "3rem",
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="添加参考图"
            style={{
              position: "absolute",
              right: "0.625rem",
              bottom: "0.625rem",
              background: "var(--secondary-button)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "0.375rem",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.6875rem",
            }}
          >
            <ImagePlus size={14} />
            参考图
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        {dragOver && (
          <div
            style={{
              padding: "0.5rem",
              border: "2px dashed var(--accent)",
              borderRadius: "var(--radius)",
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.375rem",
            }}
          >
            <Upload size={14} />
            拖放图片到此处添加参考图
          </div>
        )}

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          {/* Count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <label
              style={{
                fontSize: "0.75rem",
                color: "var(--muted-foreground)",
                whiteSpace: "nowrap",
              }}
            >
              张数
            </label>
            <input
              type="number"
              min={1}
              max={MAX_GENERATE_COUNT}
              value={count}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setCount(Math.max(1, Math.min(MAX_GENERATE_COUNT, val)));
                }
              }}
              className="task-text-input"
              style={{
                width: "3.5rem",
                textAlign: "center",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
              }}
            />
          </div>

          {/* Size */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <label
              style={{
                fontSize: "0.75rem",
                color: "var(--muted-foreground)",
                whiteSpace: "nowrap",
              }}
            >
              尺寸
            </label>
            <div
              style={{
                display: "flex",
                gap: "0.125rem",
                background: "var(--secondary-button)",
                borderRadius: "var(--radius)",
                padding: "0.125rem",
              }}
            >
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "calc(var(--radius) * 0.6)",
                    border: "none",
                    background:
                      size === s ? "var(--card)" : "transparent",
                    color: size === s ? "var(--foreground)" : "var(--muted-foreground)",
                    fontSize: "0.6875rem",
                    fontWeight: size === s ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.1s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {SIZE_LABELS[s] || s}
                </button>
              ))}
            </div>
          </div>

          {/* Credits info */}
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--muted-foreground)",
              marginLeft: "auto",
            }}
          >
            余额 {credits} 张
            {count > credits && (
              <span style={{ color: "var(--danger)", marginLeft: "0.25rem" }}>
                · 额度不足
              </span>
            )}
          </span>

          {/* Generate button */}
          <button
            className="task-button task-button-primary"
            onClick={onSubmit}
            disabled={disabled || loading || !prompt.trim() || count > credits}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                运行中
              </>
            ) : (
              <>
                <Sparkles size={14} />
                生成
              </>
            )}
          </button>
        </div>

        {/* Helper text */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            fontSize: "0.625rem",
            color: "var(--muted-foreground)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Clipboard size={10} />
            支持粘贴图片
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Upload size={10} />
            支持拖放图片
          </span>
          <span>最多 {MAX_REFERENCE_IMAGES} 张参考图</span>
          <span>Enter 发送，Shift+Enter 换行</span>
        </div>
      </div>
    </div>
  );
}
