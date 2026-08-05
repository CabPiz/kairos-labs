interface ModalErrorBannerProps {
  readonly message: string;
}

export function ModalErrorBanner({ message }: ModalErrorBannerProps) {
  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "0.65rem 0.9rem",
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: "6px",
        color: "rgba(239,68,68,0.9)",
        fontSize: "0.78rem",
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}
