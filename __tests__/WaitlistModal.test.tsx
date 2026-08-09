import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WaitlistModal } from "@/components/waitlist/WaitlistModal";
import * as waitlistAction from "@/components/waitlist/waitlist-action";

jest.mock("@/components/waitlist/waitlist-action", () => ({
  joinWaitlistAction: jest.fn(),
}));

const mockAction = waitlistAction.joinWaitlistAction as jest.Mock;

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  productId: "devprint",
  productName: "DevPrint",
  productColor: "#3b82f6",
};

function renderModal(props = {}) {
  return render(<WaitlistModal {...defaultProps} {...props} />);
}

describe("WaitlistModal", () => {
  beforeEach(() => {
    mockAction.mockReset();
  });

  describe("renderização inicial", () => {
    it("exibe o título Acesso Antecipado", () => {
      renderModal();
      expect(screen.getByText("Acesso Antecipado")).toBeInTheDocument();
    });

    it("exibe o nome do produto na descrição", () => {
      renderModal();
      // O productName fica embutido na frase — verificamos via textContent do dialog
      expect(screen.getByRole("dialog")).toHaveTextContent("DevPrint");
    });

    it("exibe o campo de e-mail", () => {
      renderModal();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    });

    it("exibe o botão de submit", () => {
      renderModal();
      expect(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      ).toBeInTheDocument();
    });

    it("exibe o aviso de sem spam", () => {
      renderModal();
      expect(screen.getByText(/sem spam/i)).toBeInTheDocument();
    });

    it("não renderiza quando open=false", () => {
      renderModal({ open: false });
      expect(screen.queryByText("Acesso Antecipado")).not.toBeInTheDocument();
    });
  });

  describe("validação client-side", () => {
    it("exibe erro quando e-mail está vazio ao submeter", async () => {
      renderModal();
      await userEvent.click(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      );
      expect(
        await screen.findByText(/e-mail é obrigatório/i)
      ).toBeInTheDocument();
    });

    it("exibe erro quando e-mail tem formato inválido", async () => {
      renderModal();
      const input = screen.getByLabelText(/e-mail/i);
      await userEvent.type(input, "nao-e-email");
      // fireEvent.submit bypassa a constraint validation nativa do jsdom no type="email"
      fireEvent.submit(input.closest("form")!);
      await waitFor(() => {
        expect(screen.getByText(/formato de e-mail inv/i)).toBeInTheDocument();
      });
    });

    it("não chama a action quando a validação falha", async () => {
      renderModal();
      await userEvent.click(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      );
      await screen.findByText(/e-mail é obrigatório/i);
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe("estado success", () => {
    it("exibe painel de sucesso após cadastro", async () => {
      mockAction.mockResolvedValueOnce({
        status: "success",
        email: "test@example.com",
      });
      renderModal();
      await userEvent.type(
        screen.getByLabelText(/e-mail/i),
        "test@example.com"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      );
      await waitFor(() => {
        expect(screen.getByText(/você está na lista/i)).toBeInTheDocument();
      });
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  describe("estado duplicate", () => {
    it("exibe painel de já registrado quando e-mail é duplicado", async () => {
      mockAction.mockResolvedValueOnce({ status: "duplicate" });
      renderModal();
      await userEvent.type(
        screen.getByLabelText(/e-mail/i),
        "existing@example.com"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      );
      await waitFor(() => {
        expect(screen.getByText(/já registrado/i)).toBeInTheDocument();
      });
    });
  });

  describe("fechar modal (handleOpenChange)", () => {
    it("botão OK no painel de sucesso chama onOpenChange(false)", async () => {
      const onOpenChange = jest.fn();
      mockAction.mockResolvedValueOnce({
        status: "success",
        email: "test@example.com",
      });
      render(<WaitlistModal {...defaultProps} onOpenChange={onOpenChange} />);
      await userEvent.type(
        screen.getByLabelText(/e-mail/i),
        "test@example.com"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      );
      await waitFor(() =>
        expect(screen.getByText(/você está na lista/i)).toBeInTheDocument()
      );
      await userEvent.click(screen.getByRole("button", { name: /ok/i }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("botão OK no painel de duplicado chama onOpenChange(false)", async () => {
      const onOpenChange = jest.fn();
      mockAction.mockResolvedValueOnce({ status: "duplicate" });
      render(<WaitlistModal {...defaultProps} onOpenChange={onOpenChange} />);
      await userEvent.type(
        screen.getByLabelText(/e-mail/i),
        "dup@example.com"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      );
      await waitFor(() =>
        expect(screen.getByText(/já registrado/i)).toBeInTheDocument()
      );
      await userEvent.click(screen.getByRole("button", { name: /ok/i }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("estado error", () => {
    it("exibe banner de erro quando a action retorna erro", async () => {
      mockAction.mockResolvedValueOnce({
        status: "error",
        message: "Erro interno. Tente novamente em instantes.",
      });
      renderModal();
      await userEvent.type(
        screen.getByLabelText(/e-mail/i),
        "valid@example.com"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /garantir acesso antecipado/i })
      );
      await waitFor(() => {
        expect(
          screen.getByText(/erro interno/i)
        ).toBeInTheDocument();
      });
    });
  });
});
