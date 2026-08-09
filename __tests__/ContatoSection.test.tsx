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

  it.each(["GitHub", "LinkedIn", "E-mail"])(
    "exibe o card %s com link externo",
    (label) => {
      render(<ContatoSection />);
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  );

  it("exibe o botão de formulário de contato", () => {
    render(<ContatoSection />);
    expect(
      screen.getByRole("button", { name: /preencher formulário/i })
    ).toBeInTheDocument();
  });

  it("abre o ContactModal ao clicar no botão de formulário", () => {
    render(<ContatoSection />);
    fireEvent.click(screen.getByRole("button", { name: /preencher formulário/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it.each(["mouseOver", "focus"] as const)(
    "altera estilo do card GitHub no evento %s",
    (event) => {
      render(<ContatoSection />);
      const link = screen.getByRole("link", { name: /github/i });
      fireEvent[event](link);
      expect(link.style.borderColor).toBe("rgba(74,144,226,0.4)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura estilo do card GitHub no evento %s",
    (event) => {
      render(<ContatoSection />);
      const link = screen.getByRole("link", { name: /github/i });
      fireEvent[event](link);
      expect(link.style.borderColor).toBe("rgba(59,130,246,0.14)");
    }
  );

  it.each(["mouseOver", "focus"] as const)(
    "altera estilo do botão de formulário no evento %s",
    (event) => {
      render(<ContatoSection />);
      const btn = screen.getByRole("button", { name: /preencher formulário/i });
      fireEvent[event](btn);
      expect(btn.style.background).toMatch(/rgba\(59,\s*130,\s*246,\s*0\.1\)/);
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura estilo do botão de formulário no evento %s",
    (event) => {
      render(<ContatoSection />);
      const btn = screen.getByRole("button", { name: /preencher formulário/i });
      fireEvent[event](btn);
      expect(btn.style.background).toBe("transparent");
    }
  );
});
