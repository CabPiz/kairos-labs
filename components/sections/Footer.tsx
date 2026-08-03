"use client";

import { Mail } from "lucide-react";

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ReactNode;
  readonly external?: boolean;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/CabPiz",
    icon: <GithubIcon />,
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/kairos-labs-tech",
    icon: <LinkedinIcon />,
    external: true,
  },
  {
    label: "E-mail",
    href: "https://mail.google.com/mail/?view=cm&to=contact.kairoslabs@gmail.com",
    icon: <Mail size={18} />,
    external: true,
  },
];

export function Footer() {
  return (
    <footer
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "rgba(5,10,30,0.97)",
        borderTop: "1px solid rgba(59,130,246,0.25)",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.45)",
          fontSize: "0.78rem",
          letterSpacing: "0.03em",
        }}
      >
        Kairos Labs © 2026 — INPI Processo Nº 944610498
      </p>

      <nav
        aria-label="Links sociais"
        style={{ display: "flex", gap: "1.25rem" }}
      >
        {SOCIAL_LINKS.map(({ label, href, icon, external }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            style={{
              color: "rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(74,144,226,1)")
            }
            onFocus={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(74,144,226,1)")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)")
            }
            onBlur={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)")
            }
          >
            {icon}
          </a>
        ))}
      </nav>
    </footer>
  );
}
