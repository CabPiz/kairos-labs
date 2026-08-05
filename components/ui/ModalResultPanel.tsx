"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ModalResultPanelProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly icon: React.ReactNode;
  readonly iconColor: string;
  readonly title: string;
  readonly message: React.ReactNode;
  readonly buttonColor: string;
  readonly buttonLabel?: string;
}

export function ModalResultPanel({
  open,
  onOpenChange,
  icon,
  iconColor,
  title,
  message,
  buttonColor,
  buttonLabel = "OK",
}: ModalResultPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-0 p-0 overflow-hidden"
        style={{
          background: "#0b1221",
          border: "1px solid rgba(59,130,246,0.2)",
          maxWidth: "420px",
        }}
      >
        <div
          style={{
            padding: "2.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: `${iconColor}1f`,
              border: `1px solid ${iconColor}59`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>

          <div>
            <h2
              style={{
                margin: "0 0 0.5rem",
                color: "#fff",
                fontSize: "1.1rem",
                fontWeight: 700,
                fontFamily: "var(--font-orbitron), sans-serif",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {title}
            </h2>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.88rem",
                lineHeight: 1.65,
              }}
            >
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={{
              marginTop: "0.4rem",
              padding: "0.6rem 2rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#050a14",
              background: buttonColor,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
