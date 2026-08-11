import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import * as feedbackAction from "@/components/feedback/feedback-action";

jest.mock("@/components/feedback/feedback-action", () => ({
  sendFeedbackAction: jest.fn(),
}));

const mockAction = feedbackAction.sendFeedbackAction as jest.Mock;

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  productId: "devprint",
  productName: "DevPrint",
  productColor: "#4a90e2",
};

function renderModal(props = {}) {
  return render(<FeedbackModal {...defaultProps} {...props} />);
}

describe("FeedbackModal", () => {
  beforeEach(() => {
    mockAction.mockReset();
    mockAction.mockResolvedValue({ status: "idle" });
  });

  describe("renderização inicial", () => {
    it("exibe o título Enviar Sugestão", () => {
      renderModal();
      expect(screen.getAllByText(/enviar sugestão/i).length).toBeGreaterThan(0);
    });

    it("exibe o nome do produto", () => {
      renderModal();
      expect(screen.getByText(/devprint/i)).toBeInTheDocument();
    });

    it("exibe o campo de mensagem obrigatório", () => {
      renderModal();
      expect(screen.getByLabelText(/mensagem/i)).toBeInTheDocument();
    });

    it("não renderiza quando open=false", () => {
      renderModal({ open: false });
      expect(screen.queryByText(/enviar sugestão/i)).not.toBeInTheDocument();
    });
  });

  describe("estado success", () => {
    it("exibe painel de sucesso após envio", async () => {
      mockAction.mockResolvedValueOnce({ status: "success" });
      renderModal();
      await userEvent.type(
        screen.getByLabelText(/mensagem/i),
        "Esta é uma sugestão válida com mais de dez caracteres"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /enviar sugestão/i })
      );
      await waitFor(() => {
        expect(screen.getByText(/sugestão enviada/i)).toBeInTheDocument();
      });
    });

    it("botão OK no painel de sucesso chama onOpenChange(false)", async () => {
      const onOpenChange = jest.fn();
      mockAction.mockResolvedValueOnce({ status: "success" });
      render(<FeedbackModal {...defaultProps} onOpenChange={onOpenChange} />);
      await userEvent.type(
        screen.getByLabelText(/mensagem/i),
        "Esta é uma sugestão válida com mais de dez caracteres"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /enviar sugestão/i })
      );
      expect(await screen.findByText(/sugestão enviada/i)).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /ok/i }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("validação client-side", () => {
    it("exibe erro de mensagem quando mensagem está vazia ao submeter", async () => {
      renderModal();
      await userEvent.click(
        screen.getByRole("button", { name: /enviar sugestão/i })
      );
      expect(await screen.findByText(/pelo menos 10 caracteres/i)).toBeInTheDocument();
    });

    it("exibe erro de e-mail quando formato é inválido", async () => {
      renderModal();
      const emailInput = screen.getByPlaceholderText(/seu@email/i);
      await userEvent.type(emailInput, "invalido");
      await userEvent.type(
        screen.getByLabelText(/mensagem/i),
        "mensagem válida com mais de dez caracteres"
      );
      // fireEvent.submit bypassa a constraint validation nativa do jsdom no type="email"
      fireEvent.submit(emailInput.closest("form")!);
      expect(await screen.findByText(/formato de e-mail inválido/i)).toBeInTheDocument();
    });

    it("aceita nome preenchido no submit", async () => {
      mockAction.mockResolvedValueOnce({ status: "success" });
      renderModal();
      await userEvent.type(
        screen.getByPlaceholderText(/seu nome/i),
        "César"
      );
      await userEvent.type(
        screen.getByLabelText(/mensagem/i),
        "mensagem válida com mais de dez caracteres"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /enviar sugestão/i })
      );
      expect(await screen.findByText(/sugestão enviada/i)).toBeInTheDocument();
    });
  });

  describe("estado error", () => {
    it("exibe banner de erro quando a action retorna erro", async () => {
      mockAction.mockResolvedValueOnce({
        status: "error",
        message: "Não foi possível enviar a sugestão.",
      });
      renderModal();
      await userEvent.type(
        screen.getByLabelText(/mensagem/i),
        "Esta é uma sugestão válida com mais de dez caracteres"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /enviar sugestão/i })
      );
      await waitFor(() => {
        expect(
          screen.getByText(/não foi possível/i)
        ).toBeInTheDocument();
      });
    });
  });
});
