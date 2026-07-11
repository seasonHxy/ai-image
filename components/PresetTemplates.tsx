"use client";

import { ImagePlus } from "lucide-react";
import { PRESET_TEMPLATES } from "@/lib/presets";
import { SIZE_LABELS } from "@/lib/types";

interface PresetTemplatesProps {
  onSelect?: (preset: (typeof PRESET_TEMPLATES)[0]) => void;
  compact?: boolean;
}

export function PresetTemplates({ onSelect, compact }: PresetTemplatesProps) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: compact
          ? "repeat(auto-fill, minmax(180px, 1fr))"
          : "repeat(auto-fill, minmax(220px, 1fr))",
      }}
    >
      {PRESET_TEMPLATES.map((preset) => (
        <div
          key={preset.id}
          className="preset-card"
          onClick={() => onSelect?.(preset)}
        >
          <div
            style={{
              aspectRatio: compact ? "16/10" : "4/3",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <PresetIcon id={preset.id} />
            {preset.needsReference && (
              <span
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  fontSize: "0.625rem",
                  padding: "0.125rem 0.375rem",
                  borderRadius: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.125rem",
                }}
              >
                <ImagePlus size={10} />
                需参考图
              </span>
            )}
          </div>
          <div style={{ padding: "0.625rem 0.75rem" }}>
            <h3
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              {preset.title}
            </h3>
            <p
              style={{
                fontSize: "0.6875rem",
                color: "var(--muted-foreground)",
                lineHeight: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {preset.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.375rem",
                fontSize: "0.625rem",
                color: "var(--muted-foreground)",
              }}
            >
              <span>{preset.count} 张</span>
              <span>·</span>
              <span>{SIZE_LABELS[preset.size] || preset.size}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PresetIcon({ id }: { id: string }) {
  const icons: Record<string, string> = {
    "ecommerce-suite": "🛍️",
    "world-landmarks": "🗽",
    "portrait-editorial": "👤",
    "wedding-portrait": "💍",
    "senior-portrait": "👴",
    "men-cool-portrait": "💼",
    "women-elegant-portrait": "💃",
    "kids-series": "🧒",
  };
  return (
    <span style={{ fontSize: "2.5rem" }} role="img">
      {icons[id] || "🖼️"}
    </span>
  );
}
