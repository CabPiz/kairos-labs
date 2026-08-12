import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SobreSection } from "@/components/sections/SobreSection";

describe("SobreSection", () => {
  it("renderiza com id='sobre' para navegação por âncora", () => {
    render(<SobreSection />);
    expect(document.getElementById("sobre")).toBeInTheDocument();
  });

  it("exibe o título da seção", () => {
    render(<SobreSection />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("exibe o texto introdutório sobre a empresa", () => {
    render(<SobreSection />);
    expect(screen.getByText(/laboratório de tecnologia/i)).toBeInTheDocument();
  });

  it.each(["Missão", "Abordagem", "Qualidade"])(
    "exibe o pilar %s",
    (pilar) => {
      render(<SobreSection />);
      expect(screen.getByText(pilar)).toBeInTheDocument();
    }
  );

  it("exibe o número de registro INPI", () => {
    render(<SobreSection />);
    expect(screen.getByText(/INPI Nº 944610498/i)).toBeInTheDocument();
  });

  it.each(["Missão", "Abordagem", "Qualidade"])(
    "aplica estilo glassmorphism no card %s ao hover",
    (pilar) => {
      render(<SobreSection />);
      const heading = screen.getByText(pilar);
      const card = heading.closest("div") as HTMLElement;

      fireEvent.mouseOver(card);
      expect(card.style.borderColor).toBe("rgba(0,240,255,0.4)");

      fireEvent.mouseOut(card);
      expect(card.style.borderColor).toBe("rgba(0,240,255,0.15)");
    }
  );

  it.each(["Missão", "Abordagem", "Qualidade"])(
    "aplica estilo glassmorphism no card %s ao focus",
    (pilar) => {
      render(<SobreSection />);
      const heading = screen.getByText(pilar);
      const card = heading.closest("div") as HTMLElement;

      fireEvent.focus(card);
      expect(card.style.borderColor).toBe("rgba(0,240,255,0.4)");

      fireEvent.blur(card);
      expect(card.style.borderColor).toBe("rgba(0,240,255,0.15)");
    }
  );
});
