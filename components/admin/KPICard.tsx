interface KPICardProps {
  readonly label: string;
  readonly value: string | number;
  readonly sublabel?: string;
  readonly highlight?: boolean;
}

export function KPICard({ label, value, sublabel, highlight = false }: KPICardProps) {
  return (
    <div
      style={{
        background: highlight ? "rgba(212,163,56,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${highlight ? "rgba(212,163,56,0.35)" : "rgba(0,240,255,0.14)"}`,
        borderRadius: "12px",
        padding: "1.5rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        minWidth: "180px",
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: highlight ? "rgba(212,163,56,0.8)" : "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "2.2rem",
          fontWeight: 700,
          color: highlight ? "#D4A338" : "#fff",
          lineHeight: 1,
          fontFamily: "var(--font-rajdhani), sans-serif",
        }}
      >
        {value}
      </span>
      {sublabel && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.4)",
            marginTop: "0.15rem",
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
}
