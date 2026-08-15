import { useTranslations } from "next-intl";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        padding: "1.25rem 2rem",
        background: "rgba(5,10,30,0.97)",
        borderTop: "1px solid rgba(59,130,246,0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/privacy"
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.7rem",
            textDecoration: "none",
            letterSpacing: "0.03em",
            transition: "color 0.2s",
          }}
        >
          {t("privacy")}
        </Link>
        <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.7rem" }}>·</span>
        <Link
          href="/terms"
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.7rem",
            textDecoration: "none",
            letterSpacing: "0.03em",
            transition: "color 0.2s",
          }}
        >
          {t("terms")}
        </Link>
        <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.7rem" }}>·</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "rgba(255,255,255,0.2)",
            fontSize: "0.7rem",
          }}
        >
          🤖 {t("aiPowered")}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.2)",
          fontSize: "0.7rem",
          letterSpacing: "0.03em",
        }}
      >
        {t("copyright")}
      </p>
    </footer>
  );
}
