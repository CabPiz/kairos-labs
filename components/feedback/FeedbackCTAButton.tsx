"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeedbackModal } from "./FeedbackModal";

interface FeedbackCTAButtonProps {
  readonly productId: string;
  readonly productName: string;
  readonly productColor: string;
}

export function FeedbackCTAButton({
  productId,
  productName,
  productColor,
}: FeedbackCTAButtonProps) {
  const t = useTranslations("feedbackModal");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.7rem 1.6rem",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: productColor,
          background: "transparent",
          border: `1px solid ${productColor}50`,
          borderRadius: "6px",
          cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = productColor;
          e.currentTarget.style.background = `${productColor}10`;
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = productColor;
          e.currentTarget.style.background = `${productColor}10`;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = `${productColor}50`;
          e.currentTarget.style.background = "transparent";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = `${productColor}50`;
          e.currentTarget.style.background = "transparent";
        }}
      >
        <MessageSquare size={14} />
        {t("title")}
      </button>

      <FeedbackModal
        open={open}
        onOpenChange={setOpen}
        productId={productId}
        productName={productName}
        productColor={productColor}
      />
    </>
  );
}
