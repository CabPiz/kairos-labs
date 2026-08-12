"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";

export function LoginForm() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t("invalidCredentials"));
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-[0.4rem]">
        <label
          htmlFor="email"
          className="text-xs font-semibold tracking-[0.1em] uppercase text-white/50"
        >
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-white/5 border border-white/[0.12] rounded-[8px] px-4 py-3 text-white text-[0.9rem] outline-none"
        />
      </div>

      <div className="flex flex-col gap-[0.4rem]">
        <label
          htmlFor="password"
          className="text-xs font-semibold tracking-[0.1em] uppercase text-white/50"
        >
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-white/5 border border-white/[0.12] rounded-[8px] px-4 py-3 text-white text-[0.9rem] outline-none"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="m-0 px-4 py-[0.65rem] bg-red-500/10 border border-red-500/30 rounded-[8px] text-[#f87171] text-[0.82rem]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: "0.5rem",
          paddingTop: "0.8rem",
          paddingBottom: "0.8rem",
          border: "none",
          borderRadius: "8px",
          color: "#070A12",
          fontFamily: "var(--font-rajdhani), var(--font-inter), sans-serif",
          fontWeight: 700,
          fontSize: "0.9rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: loading
            ? "rgba(212,163,56,0.45)"
            : "linear-gradient(135deg, #D4A338 0%, #C59128 100%)",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "opacity 0.2s",
        }}
      >
        {loading ? t("loading") : t("submit")}
      </button>
    </form>
  );
}
