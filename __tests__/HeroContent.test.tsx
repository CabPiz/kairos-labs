import React from "react";
import { render, screen } from "@testing-library/react";
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

  it("exibe o link Explorar Soluções apontando para #products", () => {
    render(<HeroContent />);
    const link = screen.getByRole("link", { name: /explorar soluções/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#products");
  });

  it("exibe o link Falar com Especialista apontando para #contato", () => {
    render(<HeroContent />);
    const link = screen.getByRole("link", { name: /falar com especialista/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#contato");
  });
});
