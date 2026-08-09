import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactModal } from "@/components/contact/ContactModal";
import * as contactAction from "@/components/contact/contact-action";

jest.mock("@/components/contact/contact-action", () => ({
  sendContactAction: jest.fn(),
}));

const mockAction = contactAction.sendContactAction as jest.Mock;

function renderModal(open = true) {
  return render(<ContactModal open={open} onOpenChange={jest.fn()} />);
}

describe("ContactModal", () => {
  beforeEach(() => {
    mockAction.mockReset();
    mockAction.mockResolvedValue({ status: "idle" });
  });

  describe("renderização inicial", () => {
    it("exibe o título do modal", () => {
      renderModal();
      expect(screen.getByText(/vamos conversar sobre seu projeto/i)).toBeInTheDocument();
    });

    it("exibe os campos obrigatórios", () => {
      renderModal();
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo de projeto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição breve/i)).toBeInTheDocument();
    });

    it("exibe as opções do select de tipo de projeto", () => {
      renderModal();
      const select = screen.getByLabelText(/tipo de projeto/i);
      expect(select).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Desenvolvimento Web" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "IA & Automação" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Consultoria Técnica" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Outro" })).toBeInTheDocument();
    });

    it("não renderiza quando open=false", () => {
      renderModal(false);
      expect(screen.queryByText(/vamos conversar/i)).not.toBeInTheDocument();
    });
  });

  describe("validação client-side", () => {
    it.each([
      ["nome", /nome é obrigatório/i],
      ["e-mail", /e-mail é obrigatório/i],
      ["descrição", /descrição é obrigatória/i],
    ])("exibe erro de validação para campo %s vazio", async (_, errorPattern) => {
      renderModal();
      await userEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
      expect(await screen.findByText(errorPattern)).toBeInTheDocument();
    });
  });

  describe("estado de loading", () => {
    it("exibe estado de loading durante o submit", async () => {
      mockAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ status: "success" }), 200))
      );
      renderModal();
      await userEvent.type(screen.getByLabelText(/nome/i), "César");
      await userEvent.type(screen.getByLabelText(/e-mail/i), "cesar@exemplo.com");
      await userEvent.type(screen.getByLabelText(/descrição breve/i), "Preciso de um sistema de gestão completo.");
      await userEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
      expect(await screen.findByText(/enviando/i)).toBeInTheDocument();
    });
  });

  describe("estado success", () => {
    it("exibe painel de sucesso após envio bem-sucedido", async () => {
      mockAction.mockResolvedValueOnce({ status: "success" });
      renderModal();
      await userEvent.type(screen.getByLabelText(/nome/i), "César");
      await userEvent.type(screen.getByLabelText(/e-mail/i), "cesar@exemplo.com");
      await userEvent.type(screen.getByLabelText(/descrição breve/i), "Preciso de um sistema de gestão completo.");
      await userEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
      expect(await screen.findByText(/mensagem enviada/i)).toBeInTheDocument();
    });
  });

  describe("estado de erro", () => {
    it("exibe banner de erro quando a action retorna erro", async () => {
      mockAction.mockResolvedValueOnce({ status: "error", message: "Erro interno. Tente novamente." });
      renderModal();
      await userEvent.type(screen.getByLabelText(/nome/i), "César");
      await userEvent.type(screen.getByLabelText(/e-mail/i), "cesar@exemplo.com");
      await userEvent.type(screen.getByLabelText(/descrição breve/i), "Preciso de um sistema de gestão completo.");
      await userEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
      expect(await screen.findByText(/erro interno/i)).toBeInTheDocument();
    });
  });
});
