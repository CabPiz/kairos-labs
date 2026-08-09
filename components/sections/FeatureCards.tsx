"use client";

import { useTranslations } from "next-intl";

const featureKeys = ["performance", "seguranca", "escalabilidade", "inovacao"] as const;

const icons = {
  performance: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  seguranca: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  escalabilidade: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  inovacao: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

export function FeatureCards() {
  const t = useTranslations("featureCards");

  return (
    <div
      className="relative z-30 grid grid-cols-2 md:grid-cols-4 border-t border-blue-500/25 overflow-hidden"
      style={{ marginTop: "auto" }}
    >
      {featureKeys.map((key, i) => (
        <div
          key={key}
          className={`flex items-start gap-4 px-5 py-5 md:px-[1.8rem] md:py-[1.4rem] bg-[rgba(5,10,30,0.82)] border-r border-blue-500/20${i < 2 ? " border-b md:border-b-0" : ""}`}
        >
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
            {icons[key]}
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
              {t(`${key}.title`)}
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
              {t(`${key}.description`)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
