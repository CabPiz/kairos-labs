import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroContent } from "@/components/sections/HeroContent";

describe("HeroContent", () => {
  it("renderiza o heading principal", () => {
    render(<HeroContent />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("exibe as três primeiras linhas da headline", () => {
    render(<HeroContent />);
    expect(screen.getByText("Tecnologia")).toBeInTheDocument();
    expect(screen.getByText("e Estratégia")).toBeInTheDocument();
    expect(screen.getByText("em Perfeito")).toBeInTheDocument();
  });

  it("exibe a palavra-chave dourada Sincronismo", () => {
    render(<HeroContent />);
    expect(screen.getByText(/Sincronismo/i)).toBeInTheDocument();
  });

  it("exibe o subtítulo descritivo", () => {
    render(<HeroContent />);
    expect(
      screen.getByText(/soluções digitais avançadas/i)
    ).toBeInTheDocument();
  });

  it("exibe o botão Explorar Soluções", () => {
    render(<HeroContent />);
    expect(
      screen.getByRole("button", { name: /explorar soluções/i })
    ).toBeInTheDocument();
  });

  it("exibe o botão Falar com Especialista", () => {
    render(<HeroContent />);
    expect(
      screen.getByRole("button", { name: /falar com especialista/i })
    ).toBeInTheDocument();
  });

  it("botão Explorar Soluções navega para /solucoes", async () => {
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: mockLocation,
    });
    render(<HeroContent />);
    await userEvent.click(
      screen.getByRole("button", { name: /explorar soluções/i })
    );
    expect(mockLocation.href).toBe("/solucoes");
  });
});
