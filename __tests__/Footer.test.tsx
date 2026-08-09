import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/sections/Footer";

describe("Footer", () => {
  it("renderiza o elemento footer", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("exibe o texto de copyright com o ano", () => {
    render(<Footer />);
    expect(screen.getByText(/Kairos Labs © 2026/i)).toBeInTheDocument();
  });

  it("exibe o número INPI no rodapé", () => {
    render(<Footer />);
    expect(screen.getByText(/944610498/)).toBeInTheDocument();
  });

  it("não exibe links de redes sociais (movidos para ContatoSection)", () => {
    render(<Footer />);
    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /linkedin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /e-mail/i })).not.toBeInTheDocument();
  });
});
