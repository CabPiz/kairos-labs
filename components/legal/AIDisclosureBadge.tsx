"use client";

import { useTranslations } from "next-intl";

interface AIDisclosureBadgeProps {
  variant?: "inline" | "block";
  className?: string;
}

export function AIDisclosureBadge({ variant = "inline", className = "" }: AIDisclosureBadgeProps) {
  const t = useTranslations("legal");

  if (variant === "block") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.375rem 0.75rem",
          borderRadius: "0.375rem",
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.2)",
          width: "fit-content",
        }}
      >
        <span style={{ fontSize: "0.7rem" }}>🤖</span>
        <span
          style={{
            fontSize: "0.7rem",
            color: "rgba(147,197,253,0.9)",
            letterSpacing: "0.02em",
          }}
        >
          {t("aiGeneratedContent")}
        </span>
      </div>
    );
  }

  return (
    <span
      className={className}
      title={t("aiGeneratedContentTooltip")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "0.65rem",
        color: "rgba(147,197,253,0.7)",
        letterSpacing: "0.02em",
        verticalAlign: "middle",
      }}
    >
      <span>🤖</span>
      <span>{t("aiGeneratedContent")}</span>
    </span>
  );
}
