import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavBar } from "@/components/sections/NavBar";

describe("NavBar", () => {
  it("renderiza a logo com alt Kairos Labs", () => {
    render(<NavBar />);
    expect(screen.getByAltText("Kairos Labs")).toBeInTheDocument();
  });

  it("renderiza o link da logo apontando para /", () => {
    render(<NavBar />);
    const logoLink = screen.getByRole("link", { name: /kairos labs/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renderiza os links de navegação", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: /sobre/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /tecnologia/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contato/i })
    ).toBeInTheDocument();
  });

  it("renderiza o botão Acesso com link para /admin/login", () => {
    render(<NavBar />);
    const acessoLink = screen.getByRole("link", { name: /acesso/i });
    expect(acessoLink).toHaveAttribute("href", "/admin/login");
  });

  it("altera estilo do link no mouseOver e restaura no mouseOut", () => {
    render(<NavBar />);
    const link = screen.getByRole("link", { name: /sobre/i });
    fireEvent.mouseOver(link);
    expect(link.style.color).toBe("rgb(255, 255, 255)");
    fireEvent.mouseOut(link);
    expect(link.style.color).toBe("rgba(255, 255, 255, 0.75)");
  });

  it("altera estilo do botão Acesso no mouseOver e restaura no mouseOut", () => {
    render(<NavBar />);
    const btn = screen.getByRole("button", { name: /acesso/i });
    fireEvent.mouseOver(btn);
    expect(btn.style.color).toBe("rgb(5, 10, 20)");
    fireEvent.mouseOut(btn);
    expect(btn.style.color).toBe("rgb(212, 160, 23)");
  });
});
