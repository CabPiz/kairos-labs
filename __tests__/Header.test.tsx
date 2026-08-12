import React from "react";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/sections/Header";

describe("Header", () => {
  it("renderiza o elemento banner", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("exibe o nome da marca", () => {
    render(<Header />);
    // Brand name is split into two styled spans (Kairos silver + Labs gold)
    expect(screen.getByRole("link", { name: /kairos labs/i })).toBeInTheDocument();
  });

  it("exibe o badge INPI", () => {
    render(<Header />);
    expect(screen.getByText(/INPI/i)).toBeInTheDocument();
  });

  it("exibe o link de navegação Produtos", () => {
    render(<Header />);
    const links = screen.getAllByRole("link", { name: /produtos/i });
    expect(links.length).toBeGreaterThan(0);
  });

  it("exibe o link de navegação Sobre", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /sobre/i })).toBeInTheDocument();
  });

  it("exibe o link de Acesso Antecipado", () => {
    render(<Header />);
    expect(
      screen.getByRole("link", { name: /acesso antecipado/i })
    ).toBeInTheDocument();
  });

  it("a logo tem o alt correto", () => {
    render(<Header />);
    expect(screen.getByAltText("Kairos Labs")).toBeInTheDocument();
  });
});
