import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  productId: "devprint",
  productName: "DevPrint",
  productColor: "#4a90e2",
};

function renderModal(props: Partial<typeof defaultProps> = {}) {
  return render(<FeedbackModal {...defaultProps} {...props} />);
}

function mockFetchSuccess() {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ status: "success" }),
  });
}

function mockFetchError(message = "Não foi possível enviar.") {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ status: "error", message }),
  });
}

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

describe("FeedbackModal", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ status: "idle" }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    it("exibe painel de sucesso após envio bem-sucedido", async () => {
      mockFetchSuccess();
      renderModal();
      await userEvent.type(
        screen.getByLabelText(/mensagem/i),
        "Esta é uma sugestão válida com mais de dez caracteres"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /enviar sugestão/i })
      );
      expect(await screen.findByText(/sugestão enviada/i)).toBeInTheDocument();
    });

    it("botão OK no painel de sucesso chama onOpenChange(false)", async () => {
      mockFetchSuccess();
      const onOpenChange = jest.fn();
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

    it("aceita nome preenchido no submit", async () => {
      mockFetchSuccess();
      renderModal();
      await userEvent.type(screen.getByPlaceholderText(/seu nome/i), "César");
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
    it("exibe banner de erro quando fetch retorna status error", async () => {
      mockFetchError("Não foi possível enviar.");
      renderModal();
      await userEvent.type(
        screen.getByLabelText(/mensagem/i),
        "Esta é uma sugestão válida com mais de dez caracteres"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /enviar sugestão/i })
      );
      expect(await screen.findByText(/não foi possível enviar/i)).toBeInTheDocument();
    });
  });

  describe("validação client-side", () => {
    it("exibe erro quando mensagem está vazia ao submeter", async () => {
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
      fireEvent.submit(emailInput.closest("form")!);
      expect(await screen.findByText(/formato de e-mail inválido/i)).toBeInTheDocument();
    });
  });

  describe("notificação — campo condicional (GAP-002)", () => {
    it("campo notify_email não é exibido antes de marcar o checkbox", () => {
      renderModal();
      expect(screen.queryByLabelText(/e-mail para notificação/i)).not.toBeInTheDocument();
    });

    it("exibe campo notify_email quando checkbox é marcado", async () => {
      renderModal();
      await userEvent.click(screen.getByRole("checkbox"));
      expect(screen.getByLabelText(/e-mail para notificação/i)).toBeInTheDocument();
    });

    it("oculta campo notify_email quando checkbox é desmarcado novamente", async () => {
      renderModal();
      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);
      await userEvent.click(checkbox);
      expect(screen.queryByLabelText(/e-mail para notificação/i)).not.toBeInTheDocument();
    });
  });

  describe("anexos (GAP-005)", () => {
    function uploadFiles(files: File[]) {
      const input = document.querySelector("input[type='file']") as HTMLInputElement;
      Object.defineProperty(input, "files", { value: files, configurable: true });
      act(() => { fireEvent.change(input); });
    }

    it("exibe erro para tipo de arquivo inválido", () => {
      renderModal();
      uploadFiles([makeFile("virus.exe", "application/x-msdownload")]);
      expect(screen.getByText(/tipo de arquivo não permitido/i)).toBeInTheDocument();
    });

    it("exibe erro para arquivo maior que 10 MB", () => {
      renderModal();
      uploadFiles([makeFile("grande.pdf", "application/pdf", 11 * 1024 * 1024)]);
      expect(screen.getByText(/arquivo excede o limite de 10 MB/i)).toBeInTheDocument();
    });

    it("removeFile remove o arquivo da lista (GAP-005)", async () => {
      renderModal();
      uploadFiles([makeFile("doc.pdf", "application/pdf")]);
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();
      await userEvent.click(
        screen.getByRole("button", { name: /remover doc\.pdf/i })
      );
      expect(screen.queryByText("doc.pdf")).not.toBeInTheDocument();
    });

    it("aceita arquivo PDF válido e o exibe na lista", () => {
      renderModal();
      uploadFiles([makeFile("relatorio.pdf", "application/pdf", 2048)]);
      expect(screen.getByText("relatorio.pdf")).toBeInTheDocument();
    });
  });
});
