"use client";

export default function ContactsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "1rem",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      <p style={{ fontSize: "0.875rem" }}>
        Ocorreu um erro ao carregar os contatos.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(96,165,250,0.8)",
          border: "1px solid rgba(96,165,250,0.3)",
          borderRadius: "6px",
          padding: "0.375rem 0.75rem",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
