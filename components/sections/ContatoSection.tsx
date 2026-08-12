"use client";

import { useState } from "react";
import { Mail, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContactModal } from "@/components/contact/ContactModal";

const GithubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SOCIAL_HREFS = {
  github: "https://github.com/CabPiz",
  linkedin: "https://www.linkedin.com/company/kairos-labs-tech",
  email: "https://mail.google.com/mail/?view=cm&to=contact.kairoslabs@gmail.com",
} as const;

const SOCIAL_ICONS = {
  github: <GithubIcon />,
  linkedin: <LinkedinIcon />,
  email: <Mail size={22} aria-hidden="true" />,
} as const;

const SOCIAL_LABELS: Record<keyof typeof SOCIAL_HREFS, string> = {
  github: "Github",
  linkedin: "Linkedin",
  email: "E-mail",
};

type SocialKey = keyof typeof SOCIAL_HREFS;
const socialKeys: readonly SocialKey[] = ["email", "linkedin", "github"];

const cardBaseStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1.5rem",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(59,130,246,0.14)",
  borderRadius: "12px",
  textDecoration: "none",
  color: "rgba(255,255,255,0.75)",
  transition: "border-color 0.2s, background 0.2s",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "var(--font-inter), sans-serif",
  width: "100%",
};

function onCardEnter(e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "rgba(0,240,255,0.4)";
  e.currentTarget.style.background = "rgba(0,240,255,0.05)";
}

function onCardLeave(e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "rgba(59,130,246,0.14)";
  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
}

export function ContatoSection() {
  const t = useTranslations("contato");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      id="contato"
      style={{
        padding: "5rem 1.5rem",
        background: "url('/backgrounds/contact-admin-bg.webp') center/cover no-repeat, linear-gradient(180deg, #050a14 0%, #080f1e 100%)",
        backgroundColor: "#050a14",
        borderTop: "1px solid rgba(0,240,255,0.12)",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Header */}
        <p
          style={{
            margin: "0 0 0.5rem",
            color: "#D4A338",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontFamily: "var(--font-exo2), var(--font-inter), sans-serif",
          }}
        >
          {t("eyebrow")}
        </p>
        <h2
          style={{
            margin: "0 0 1rem",
            fontFamily: "var(--font-rajdhani), var(--font-michroma), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            color: "#fff",
            lineHeight: 1.15,
          }}
        >
          {t("title")}
        </h2>
        <p
          style={{
            margin: "0 0 3.5rem",
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.95rem",
            lineHeight: 1.7,
            maxWidth: "560px",
          }}
        >
          {t("description")}
        </p>

        {/* Grid de 4 cards: formulário, e-mail, linkedin, github */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Card do formulário de contato */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={cardBaseStyle}
            onMouseOver={onCardEnter}
            onFocus={onCardEnter}
            onMouseOut={onCardLeave}
            onBlur={onCardLeave}
          >
            <div style={{ color: "rgba(0,240,255,0.9)" }}>
              <FileText size={22} aria-hidden="true" />
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 0.4rem",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#fff",
                  letterSpacing: "0.02em",
                }}
              >
                {t("form.title")}
              </p>
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.6,
                }}
              >
                {t("form.description")}
              </p>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#00F0FF",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                {t("form.cta")} →
              </span>
            </div>
          </button>

          {/* Cards de redes sociais: e-mail, linkedin, github */}
          {socialKeys.map((key) => (
            <a
              key={key}
              href={SOCIAL_HREFS[key]}
              target="_blank"
              rel="noopener noreferrer"
              style={cardBaseStyle}
              onMouseOver={onCardEnter}
              onFocus={onCardEnter}
              onMouseOut={onCardLeave}
              onBlur={onCardLeave}
            >
              <div style={{ color: "rgba(0,240,255,0.9)" }}>{SOCIAL_ICONS[key]}</div>
              <div>
                <p
                  style={{
                    margin: "0 0 0.4rem",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#fff",
                    letterSpacing: "0.02em",
                    textTransform: "capitalize",
                  }}
                >
                  {SOCIAL_LABELS[key]}
                </p>
                <p
                  style={{
                    margin: "0 0 0.75rem",
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.6,
                  }}
                >
                  {t(`social.${key}.description`)}
                </p>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#00F0FF",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  {t(`social.${key}.cta`)} →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <ContactModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
