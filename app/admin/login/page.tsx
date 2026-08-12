import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./_components/LoginForm";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";

export default async function LoginPage() {
  const t = await getTranslations("admin.login");

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050a14",
        backgroundImage: "url('/backgrounds/contact-admin-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        fontFamily: "var(--font-inter), sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(59,130,246,0.14)",
          borderRadius: "16px",
          padding: "2.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1.25rem",
          }}
        >
          <AdminLanguageSwitcher />
        </div>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.78rem",
            textDecoration: "none",
            letterSpacing: "0.05em",
            marginBottom: "1.75rem",
          }}
        >
          {t("backToSite")}
        </Link>

        <h1
          style={{
            margin: "0 0 0.5rem",
            fontFamily: "var(--font-rajdhani), var(--font-michroma), sans-serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#D4A338",
          }}
        >
          Kairos Labs
        </h1>
        <p
          style={{
            margin: "0 0 2rem",
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.82rem",
          }}
        >
          {t("accessRestricted")}
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
