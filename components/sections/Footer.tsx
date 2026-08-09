export function Footer() {
  return (
    <footer
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem 2rem",
        background: "rgba(5,10,30,0.97)",
        borderTop: "1px solid rgba(59,130,246,0.15)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.3)",
          fontSize: "0.75rem",
          letterSpacing: "0.03em",
        }}
      >
        Kairos Labs © 2026 — INPI Processo Nº 944610498
      </p>
    </footer>
  );
}
