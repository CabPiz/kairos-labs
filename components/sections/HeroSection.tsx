"use client";

import { NavBar } from "@/components/sections/NavBar";
import { HeroContent } from "@/components/sections/HeroContent";
import { FeatureCards } from "@/components/sections/FeatureCards";

export function HeroSection() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#050a14",
        overflow: "hidden",
      }}
    >
      {/* ── Imagem de fundo ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: "url('/hero-bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      {/* ── Overlay esquerdo — cobre o texto da imagem sem apagar a ampulheta (desktop) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          background:
            "linear-gradient(to right, rgba(5,10,20,0.97) 0%, rgba(5,10,20,0.97) 30%, rgba(5,10,20,0.0) 42%)",
        }}
        aria-hidden="true"
      />

      {/* ── Overlay mobile — cobre a tela inteira em portrait para legibilidade ── */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{ zIndex: 10, background: "rgba(5,10,20,0.88)" }}
        aria-hidden="true"
      />

      {/* ── Overlay inferior — escurece atrás dos feature cards ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "180px",
          zIndex: 10,
          background: "linear-gradient(to top, rgba(5,10,30,1) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Conteúdo ── */}
      <NavBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <HeroContent />
      </div>
      <FeatureCards />
    </div>
  );
}