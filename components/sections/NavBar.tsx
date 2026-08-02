"use client";

import Image from "next/image";
import Link from "next/link";

export function NavBar() {
  return (
    <nav
      className="relative z-30 flex items-center justify-between"
      style={{ padding: "1.4rem 2.5rem" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
        <Image
          src="/logo.png"
          alt="Kairos Labs"
          width={52}
          height={52}
          className="rounded-lg object-contain"
          priority
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", textDecoration: "none" }}>
          {/* "Kairos Labs™" com gradiente fiel ao logo */}
          <span
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontWeight: 700,
              fontSize: "1.35rem",
              letterSpacing: "0.06em",
              lineHeight: 1,
              background:
                "linear-gradient(to right, #7ab3e0 0%, #e8f4ff 40%, #f0c040 70%, #c8860a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textDecoration: "none",
            }}
          >
            Kairos Labs
            <sup
              style={{
                fontSize: "0.55rem",
                WebkitTextFillColor: "rgba(200,134,10,0.8)",
                marginLeft: "2px",
                verticalAlign: "super",
              }}
            >
              ™
            </sup>
          </span>


        </div>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-10">
        {["Sobre", "Soluções", "Tecnologia", "Contato"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.78rem",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "color 0.2s",
              fontFamily: "var(--font-inter), sans-serif",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          >
            {item}
          </Link>
        ))}

        {/* Botão Acesso */}
        <Link href="/admin/login">
          <button
            style={{
              border: "1.5px solid rgba(212,160,23,0.7)",
              color: "#d4a017",
              background: "transparent",
              padding: "0.45rem 1.4rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-inter), sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#d4a017";
              e.currentTarget.style.color = "#050a14";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#d4a017";
            }}
          >
            Acesso
          </button>
        </Link>
      </div>
    </nav>
  );
}