const mockTranslateFeedback = jest.fn().mockResolvedValue(null);

jest.mock("@/lib/admin/translate-feedback", () => ({
  translateFeedback: mockTranslateFeedback,
}));

const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { sendFeedbackAction } from "@/components/feedback/feedback-action";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

describe("sendFeedbackAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  describe("validação Zod", () => {
    it("retorna erro quando mensagem está vazia", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("error");
    });

    it("retorna erro quando mensagem tem menos de 10 caracteres", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "curto",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.message).toMatch(/pelo menos 10 caracteres/i);
      }
    });

    it("retorna erro quando product_id está vazio", async () => {
      const fd = makeFormData({
        product_id: "",
        mensagem: "mensagem suficientemente longa para passar",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("error");
    });

    it("retorna erro quando e-mail tem formato inválido", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        email: "nao-e-email",
        mensagem: "mensagem suficientemente longa para passar",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.message).toMatch(/e-mail/i);
      }
    });
  });

  describe("sucesso", () => {
    it("insere no Supabase e retorna success", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "mensagem de feedback com mais de dez caracteres",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("success");
      expect(mockFrom).toHaveBeenCalledWith("feedback");
    });

    it("aceita e-mail em branco (campo opcional)", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        email: "",
        mensagem: "mensagem de feedback válida aqui",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("success");
    });

    it("aceita nome e e-mail válidos", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        nome: "César",
        email: "cesar@example.com",
        mensagem: "mensagem de feedback válida aqui",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("success");
    });

    it("chama translateFeedback com o texto e locale do feedback", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "Ótimo produto para desenvolvedores!",
        locale: "pt",
      });
      await sendFeedbackAction(fd);
      expect(mockTranslateFeedback).toHaveBeenCalledWith(
        "Ótimo produto para desenvolvedores!",
        "pt"
      );
    });

    it("retorna success mesmo quando translateFeedback retorna null", async () => {
      mockTranslateFeedback.mockResolvedValue(null);
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        locale: "en",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("success");
    });

    it("inclui locale e traduções no payload do insert", async () => {
      mockTranslateFeedback.mockResolvedValue({ en: "Great!", es: "¡Genial!" });
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "Ótimo produto aqui!",
        locale: "pt",
      });
      await sendFeedbackAction(fd);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem_locale: "pt",
          mensagem_traduzida: { en: "Great!", es: "¡Genial!" },
        })
      );
    });
  });

  describe("erro do Supabase", () => {
    it("retorna error quando Supabase retorna error", async () => {
      mockInsert.mockResolvedValue({ error: { message: "DB error" } });
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
      });
      const result = await sendFeedbackAction(fd);
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.message).toMatch(/não foi possível/i);
      }
    });
  });
});
