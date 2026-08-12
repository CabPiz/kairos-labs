import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContatoSection } from "@/components/sections/ContatoSection";

jest.mock("@/components/contact/ContactModal", () => ({
  ContactModal: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">ContactModal</div> : null,
}));

describe("ContatoSection", () => {
  it("renderiza a seção com id contato", () => {
    render(<ContatoSection />);
    expect(document.getElementById("contato")).toBeInTheDocument();
  });

  it("exibe o título Contato", () => {
    render(<ContatoSection />);
    expect(screen.getByRole("heading", { name: /contato/i })).toBeInTheDocument();
  });

  it.each(["Github", "Linkedin", "E-mail"])(
    "exibe o card %s com link externo",
    (label) => {
      render(<ContatoSection />);
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  );

  it("exibe o card de formulário de contato", () => {
    render(<ContatoSection />);
    expect(
      screen.getByRole("button", { name: /formulário de contato/i })
    ).toBeInTheDocument();
  });

  it("abre o ContactModal ao clicar no card de formulário", () => {
    render(<ContatoSection />);
    fireEvent.click(screen.getByRole("button", { name: /formulário de contato/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it.each(["mouseOver", "focus"] as const)(
    "altera estilo do card Github no evento %s",
    (event) => {
      render(<ContatoSection />);
      const link = screen.getByRole("link", { name: /github/i });
      fireEvent[event](link);
      expect(link.style.borderColor).toBe("rgba(0,240,255,0.4)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura estilo do card Github no evento %s",
    (event) => {
      render(<ContatoSection />);
      const link = screen.getByRole("link", { name: /github/i });
      fireEvent[event](link);
      expect(link.style.borderColor).toBe("rgba(59,130,246,0.14)");
    }
  );

  it.each(["mouseOver", "focus"] as const)(
    "altera estilo do card de formulário no evento %s",
    (event) => {
      render(<ContatoSection />);
      const btn = screen.getByRole("button", { name: /formulário de contato/i });
      fireEvent[event](btn);
      expect(btn.style.borderColor).toBe("rgba(0,240,255,0.4)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura estilo do card de formulário no evento %s",
    (event) => {
      render(<ContatoSection />);
      const btn = screen.getByRole("button", { name: /formulário de contato/i });
      fireEvent[event](btn);
      expect(btn.style.borderColor).toBe("rgba(59,130,246,0.14)");
    }
  );
});
