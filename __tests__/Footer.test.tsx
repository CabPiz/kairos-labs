import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("exibe o link do GitHub com aria-label", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  });

  it("exibe o link do LinkedIn com aria-label", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "LinkedIn" })
    ).toBeInTheDocument();
  });

  it("exibe o link de e-mail com aria-label", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "E-mail" })).toBeInTheDocument();
  });

  it("links externos têm rel noopener noreferrer", () => {
    render(<Footer />);
    const externalLinks = [
      screen.getByRole("link", { name: "GitHub" }),
      screen.getByRole("link", { name: "LinkedIn" }),
      screen.getByRole("link", { name: "E-mail" }),
    ];
    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  it("a nav de links sociais tem aria-label", () => {
    render(<Footer />);
    expect(
      screen.getByRole("navigation", { name: /links sociais/i })
    ).toBeInTheDocument();
  });

  it("altera a cor do link no mouseOver e restaura no mouseOut", () => {
    render(<Footer />);
    const github = screen.getByRole("link", { name: "GitHub" });
    fireEvent.mouseOver(github);
    expect(github.style.color).toBe("rgb(74, 144, 226)");
    fireEvent.mouseOut(github);
    expect(github.style.color).toBe("rgba(255, 255, 255, 0.45)");
  });

  it("altera a cor do link no focus e restaura no blur", () => {
    render(<Footer />);
    const linkedin = screen.getByRole("link", { name: "LinkedIn" });
    fireEvent.focus(linkedin);
    expect(linkedin.style.color).toBe("rgb(74, 144, 226)");
    fireEvent.blur(linkedin);
    expect(linkedin.style.color).toBe("rgba(255, 255, 255, 0.45)");
  });
});
