"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 40,
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        border: "1px solid rgba(59,130,246,0.35)",
        background: "rgba(5,10,20,0.85)",
        color: "rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        transition: "border-color 0.2s, color 0.2s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "rgba(74,144,226,0.7)";
        e.currentTarget.style.color = "#fff";
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(74,144,226,0.7)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)";
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)";
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
      }}
    >
      ↑
    </button>
  );
}
