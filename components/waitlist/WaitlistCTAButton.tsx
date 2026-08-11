"use client";

import { useState } from "react";
import { WaitlistModal } from "./WaitlistModal";

interface WaitlistCTAButtonProps {
  readonly productId: string;
  readonly productName: string;
  readonly productColor: string;
  readonly ctaLabel: string;
}

export function WaitlistCTAButton({
  productId,
  productName,
  productColor,
  ctaLabel,
}: WaitlistCTAButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "0.7rem 2rem",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#050a14",
          background: productColor,
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "filter 0.2s",
        }}
        onMouseOver={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.filter =
            "brightness(0.85)")
        }
        onFocus={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.filter =
            "brightness(0.85)")
        }
        onMouseOut={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)")
        }
        onBlur={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)")
        }
      >
        {ctaLabel}
      </button>

      <WaitlistModal
        open={open}
        onOpenChange={setOpen}
        productId={productId}
        productName={productName}
        productColor={productColor}
      />
    </>
  );
}