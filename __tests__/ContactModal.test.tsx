import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

  describe("anexos de arquivo", () => {
    function makeFile(name: string, type: string): File {
      return new File(["x"], name, { type });
    }

    function upload(file: File) {
      const input = document.getElementById("contact-files") as HTMLInputElement;
      const files = [file];
      const mockFileList = Object.assign(files, { item: (i: number) => files[i] });
      Object.defineProperty(input, "files", { value: mockFileList, configurable: true });
      fireEvent.change(input);
    }

    it("exibe o botão de adicionar arquivo", () => {
      renderModal();
      expect(screen.getByText(/adicionar arquivo/i)).toBeInTheDocument();
    });

    it("adiciona arquivo válido à lista após seleção", () => {
      renderModal();
      upload(makeFile("doc.pdf", "application/pdf"));
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    });

    it("exibe erro de tipo de arquivo não permitido", () => {
      renderModal();
      upload(makeFile("virus.exe", "application/x-msdownload"));
      expect(screen.getByText(/tipo de arquivo não permitido/i)).toBeInTheDocument();
    });

    it("não adiciona arquivo acima de 10 MB à lista", () => {
      renderModal();
      const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "grande.pdf", { type: "application/pdf" });
      upload(bigFile);
      // The file should not be added (either error shown or silently rejected)
      expect(screen.queryByText("grande.pdf")).not.toBeInTheDocument();
    });

    it("remove arquivo ao clicar no botão de remoção", () => {
      renderModal();
      upload(makeFile("doc.pdf", "application/pdf"));
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /remover doc\.pdf/i }));
      expect(screen.queryByText("doc.pdf")).not.toBeInTheDocument();
    });
  });

  describe("reset ao fechar o modal", () => {
    it("limpa arquivos selecionados ao fechar o modal", () => {
      renderModal();
      const input = document.getElementById("contact-files") as HTMLInputElement;
      const files = [new File(["x"], "doc.pdf", { type: "application/pdf" })];
      const mockFileList = Object.assign(files, { item: (i: number) => files[i] });
      Object.defineProperty(input, "files", { value: mockFileList, configurable: true });
      fireEvent.change(input);
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /close/i }));

      expect(screen.queryByText("doc.pdf")).not.toBeInTheDocument();
    });
  });

  describe("fluxo de upload de anexo no submit", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    function mockFetch(responses: Array<{ ok: boolean; json?: Record<string, unknown> }>) {
      let callIndex = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        const response = responses[callIndex++] ?? { ok: true };
        return Promise.resolve({
          ok: response.ok,
          json: async () => response.json ?? {},
        });
      }) as typeof fetch;
    }

    function makeUploadFile(name: string, type: string): File {
      return new File(["x"], name, { type });
    }

    async function submitWithFile(file: File) {
      renderModal();
      await userEvent.type(screen.getByLabelText(/nome/i), "César");
      await userEvent.type(screen.getByLabelText(/e-mail/i), "cesar@exemplo.com");
      await userEvent.type(screen.getByLabelText(/descrição breve/i), "Descrição de teste.");
      const input = document.getElementById("contact-files") as HTMLInputElement;
      const files = [file];
      const mockFileList = Object.assign(files, { item: (i: number) => files[i] });
      Object.defineProperty(input, "files", { value: mockFileList, configurable: true });
      fireEvent.change(input);
      await userEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    }

    it("conclui com sucesso quando presign, PUT e confirm respondem ok", async () => {
      mockAction.mockResolvedValueOnce({ status: "success", id: "contact-uuid" });
      mockFetch([
        { ok: true, json: { signed_url: "https://storage.example.com/upload", token: "tok", path: "contact-uuid/file.pdf" } },
        { ok: true },
        { ok: true, json: { ok: true } },
      ]);
      await submitWithFile(makeUploadFile("doc.pdf", "application/pdf"));
      expect(await screen.findByText(/mensagem enviada/i)).toBeInTheDocument();
    });

    it("exibe erro quando presign retorna status não-ok com body de erro", async () => {
      mockAction.mockResolvedValueOnce({ status: "success", id: "contact-uuid" });
      mockFetch([{ ok: false, json: { error: "Falha no presign." } }]);
      await submitWithFile(makeUploadFile("doc.pdf", "application/pdf"));
      expect(await screen.findByText(/falha no presign/i)).toBeInTheDocument();
    });

    it("exibe uploadError quando presign falha sem body de erro", async () => {
      mockAction.mockResolvedValueOnce({ status: "success", id: "contact-uuid" });
      mockFetch([{ ok: false, json: {} }]);
      await submitWithFile(makeUploadFile("doc.pdf", "application/pdf"));
      expect(await screen.findByText(/não foi possível enviar os anexos/i)).toBeInTheDocument();
    });

    it("exibe erro quando PUT direto ao Supabase retorna status não-ok", async () => {
      mockAction.mockResolvedValueOnce({ status: "success", id: "contact-uuid" });
      mockFetch([
        { ok: true, json: { signed_url: "https://storage.example.com/upload", token: "tok", path: "contact-uuid/file.pdf" } },
        { ok: false },
      ]);
      await submitWithFile(makeUploadFile("doc.pdf", "application/pdf"));
      expect(await screen.findByText(/não foi possível enviar os anexos/i)).toBeInTheDocument();
    });

    it("exibe erro quando confirm retorna status não-ok com body de erro", async () => {
      mockAction.mockResolvedValueOnce({ status: "success", id: "contact-uuid" });
      mockFetch([
        { ok: true, json: { signed_url: "https://storage.example.com/upload", token: "tok", path: "contact-uuid/file.pdf" } },
        { ok: true },
        { ok: false, json: { error: "Falha no confirm." } },
      ]);
      await submitWithFile(makeUploadFile("doc.pdf", "application/pdf"));
      expect(await screen.findByText(/falha no confirm/i)).toBeInTheDocument();
    });

    it("exibe uploadError quando confirm falha sem body de erro", async () => {
      mockAction.mockResolvedValueOnce({ status: "success", id: "contact-uuid" });
      mockFetch([
        { ok: true, json: { signed_url: "https://storage.example.com/upload", token: "tok", path: "contact-uuid/file.pdf" } },
        { ok: true },
        { ok: false, json: {} },
      ]);
      await submitWithFile(makeUploadFile("doc.pdf", "application/pdf"));
      expect(await screen.findByText(/não foi possível enviar os anexos/i)).toBeInTheDocument();
    });

    it("exibe uploadError quando fetch lança exceção não-Error", async () => {
      mockAction.mockResolvedValueOnce({ status: "success", id: "contact-uuid" });
      global.fetch = jest.fn().mockRejectedValue("network-string-error") as typeof fetch;
      await submitWithFile(makeUploadFile("doc.pdf", "application/pdf"));
      expect(await screen.findByText(/não foi possível enviar os anexos/i)).toBeInTheDocument();
    });
  });
});
