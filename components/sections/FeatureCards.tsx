"use client";

const features = [
  {
    title: "Performance",
    description: "Arquitetura escalável\ne de alta performance",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    title: "Segurança",
    description: "RLS, criptografia e\nboas práticas nativas",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: "Escalabilidade",
    description: "Infraestrutura pronta\npara o futuro",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    title: "Inovação",
    description: "IA, automação e dados\nem nosso DNA",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
];

export function FeatureCards() {
  return (
    <div
      className="relative z-30"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        borderTop: "1px solid rgba(59,130,246,0.25)",
        marginTop: "auto",
      }}
    >
      {features.map(({ title, description, icon }, i) => (
        <div
          key={title}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            padding: "1.4rem 1.8rem",
            background: "rgba(5,10,30,0.82)",
            borderRight: i < 3 ? "1px solid rgba(59,130,246,0.2)" : "none",
          }}
        >
          {/* Ícone com borda azul */}
          <div
            style={{
              flexShrink: 0,
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              border: "1px solid rgba(59,130,246,0.45)",
              background: "rgba(26,86,219,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>

          <div>
            <p
              style={{
                margin: "0 0 0.3rem",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {title}
            </p>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.82rem",
                lineHeight: 1.5,
                whiteSpace: "pre-line",
              }}
            >
              {description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}