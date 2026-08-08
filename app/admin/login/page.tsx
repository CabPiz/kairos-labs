import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { LoginForm } from "./_components/LoginForm";

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) redirect("/admin");
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050a14",
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
        <h1
          style={{
            margin: "0 0 0.5rem",
            fontFamily: "var(--font-orbitron), sans-serif",
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#d4a017",
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
          Acesso restrito ao fundador
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
