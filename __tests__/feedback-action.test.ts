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

    it("inclui mensagem_locale no payload do insert", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "Ótimo produto para desenvolvedores!",
        locale: "pt",
      });
      await sendFeedbackAction(fd);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ mensagem_locale: "pt" })
      );
    });

    it("não inclui mensagem_traduzida no payload do insert", async () => {
      const fd = makeFormData({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        locale: "pt",
      });
      await sendFeedbackAction(fd);
      const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
      expect(payload).not.toHaveProperty("mensagem_traduzida");
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
