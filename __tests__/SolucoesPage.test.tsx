import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import SolucoesPage from "@/app/solucoes/page";

describe("SolucoesPage", () => {
  it("renderiza o h1 com Nossas Soluções", () => {
    render(<SolucoesPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Nossas")).toBeInTheDocument();
  });

  it("lista os produtos DevPrint e Ascend", () => {
    render(<SolucoesPage />);
    expect(screen.getByText("DevPrint")).toBeInTheDocument();
    expect(screen.getByText("Ascend")).toBeInTheDocument();
  });

  it("lista Elucya Talk e Ágora Global", () => {
    render(<SolucoesPage />);
    expect(screen.getByText(/elucya talk/i)).toBeInTheDocument();
    expect(screen.getByText(/ágora global/i)).toBeInTheDocument();
  });

  it("exibe Kairos Labs na listagem", () => {
    render(<SolucoesPage />);
    expect(screen.getAllByText(/kairos labs/i).length).toBeGreaterThan(0);
  });

  it("exibe o link de voltar para / com texto Início", () => {
    render(<SolucoesPage />);
    const inicioLink = screen.getByRole("link", { name: /início/i });
    expect(inicioLink).toHaveAttribute("href", "/");
  });

  it("link Início aplica e restaura cor no mouseOver/mouseOut", () => {
    render(<SolucoesPage />);
    const link = screen.getByRole("link", { name: /início/i });
    fireEvent.mouseOver(link);
    expect(link.style.color).toBe("rgb(255, 255, 255)");
    fireEvent.mouseOut(link);
    expect(link.style.color).toBe("rgba(255, 255, 255, 0.55)");
  });

  it("exibe links Saiba mais para os produtos", () => {
    render(<SolucoesPage />);
    const saibaMaisLinks = screen.getAllByRole("link", { name: /saiba mais/i });
    expect(saibaMaisLinks.length).toBeGreaterThan(0);
  });

  it("links Saiba mais apontam para /solucoes/[slug]", () => {
    render(<SolucoesPage />);
    const devprintLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.includes("devprint"));
    expect(devprintLinks.length).toBeGreaterThan(0);
  });

  it("card de produto aplica estilo no mouseOver e restaura no mouseOut", () => {
    const { container } = render(<SolucoesPage />);
    const cards = container.querySelectorAll<HTMLDivElement>(
      "[style*='border-radius: 12px']"
    );
    expect(cards.length).toBeGreaterThan(0);
    const card = cards[0];
    fireEvent.mouseOver(card);
    expect(card.style.borderColor).toBe("rgba(59,130,246,0.45)");
    fireEvent.mouseOut(card);
    expect(card.style.borderColor).toBe("rgba(59,130,246,0.18)");
  });

  it("link Saiba mais aplica e restaura estilo no mouseOver/mouseOut", () => {
    render(<SolucoesPage />);
    const saibaMaisLinks = screen.getAllByRole("link", { name: /saiba mais/i });
    const link = saibaMaisLinks[0];
    fireEvent.mouseOver(link);
    expect(link.style.color).toBe("rgb(255, 255, 255)");
    fireEvent.mouseOut(link);
    expect(link.style.color).toBe("rgba(255, 255, 255, 0.75)");
  });
});
