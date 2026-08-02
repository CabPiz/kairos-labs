"use client";

export function HeroContent() {
  return (
    <div
      className="relative z-30 flex flex-col"
      style={{
        padding: "2.5rem 2.5rem 0",
        maxWidth: "52%",
      }}
    >
      {/* Headline — Orbitron para identidade tech/futurista */}
      <h1 style={{ margin: 0, padding: 0, lineHeight: 1.15 }}>
        {["Tecnologia", "e Estratégia", "em Perfeito"].map((line) => (
          <span
            key={line}
            style={{
              display: "block",
              color: "#ffffff",
              fontSize: "clamp(2.2rem, 3.8vw, 3.6rem)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "var(--font-orbitron), sans-serif",
            }}
          >
            {line}
          </span>
        ))}
        <span
          style={{
            display: "block",
            fontSize: "clamp(2.2rem, 3.8vw, 3.6rem)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontFamily: "var(--font-orbitron), sans-serif",
            color: "#d4a017",
          }}
        >
          Sincronismo.
        </span>
      </h1>

      {/* Subtítulo — Inter para legibilidade */}
      <p
        style={{
          marginTop: "1.5rem",
          marginBottom: 0,
          color: "rgba(255,255,255,0.65)",
          fontSize: "1rem",
          lineHeight: 1.6,
          maxWidth: "380px",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Construimos soluções digitais avançadas<br />
        com segurança, performance e visão de futuro.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button
          onClick={() => window.location.href = "/solucoes"}
          style={{
            background: "#1a56db",
            color: "#fff",
            border: "none",
            padding: "0.7rem 1.8rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          Explorar Soluções
        </button>

        <button
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.85)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            padding: "0.7rem 1.8rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          Falar com Especialista
        </button>
      </div>
    </div>
  );
}