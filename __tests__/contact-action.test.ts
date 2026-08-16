const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockAdminClient = { from: mockFrom };
const mockAfter = jest.fn((cb: () => unknown) => cb());
const mockNotifyWhatsApp = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

jest.mock("node:crypto", () => ({
  ...jest.requireActual("node:crypto"),
  randomUUID: () => "uuid-123",
}));

jest.mock("next/server", () => ({
  after: (cb: () => unknown) => mockAfter(cb),
}));

jest.mock("@/lib/notifications/whatsapp", () => ({
  notifyWhatsApp: (...args: unknown[]) => mockNotifyWhatsApp(...args),
}));

import { sendContactAction } from "@/components/contact/contact-action";

const validData = {
  name: "César Pizarro",
  email: "cesar@exemplo.com",
  project_type: "web",
  description: "Preciso de um sistema de gestão completo para minha empresa.",
};

describe("sendContactAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockAfter.mockImplementation((cb: () => unknown) => cb());
    mockNotifyWhatsApp.mockResolvedValue(undefined);
  });

  describe("validação Zod", () => {
    it("retorna erro quando nome está vazio", async () => {
      const result = await sendContactAction({ ...validData, name: "" });
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.message).toMatch(/nome/i);
    });

    it("retorna erro quando e-mail está vazio", async () => {
      const result = await sendContactAction({ ...validData, email: "" });
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.message).toMatch(/e-mail/i);
    });

    it("retorna erro quando e-mail tem formato inválido", async () => {
      const result = await sendContactAction({ ...validData, email: "nao-e-email" });
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.message).toMatch(/formato/i);
    });

    it("retorna erro quando tipo de projeto é inválido", async () => {
      const result = await sendContactAction({ ...validData, project_type: "Tipo Inválido" });
      expect(result.status).toBe("error");
    });

    it("retorna erro quando descrição está vazia", async () => {
      const result = await sendContactAction({ ...validData, description: "" });
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.message).toMatch(/descrição/i);
    });

    it("retorna erro quando descrição excede 500 caracteres", async () => {
      const result = await sendContactAction({ ...validData, description: "a".repeat(501) });
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.message).toMatch(/500/i);
    });
  });

  describe("sucesso", () => {
    it.each(["web", "ai", "consulting", "other"])(
      "insere no Supabase com tipo de projeto '%s'",
      async (project_type) => {
        const result = await sendContactAction({ ...validData, project_type });
        expect(result.status).toBe("success");
        expect(mockFrom).toHaveBeenCalledWith("contact_requests");
      }
    );

    it("retorna o id do registro criado no sucesso", async () => {
      const result = await sendContactAction(validData);
      expect(result.status).toBe("success");
      if (result.status === "success") expect(result.id).toBe("uuid-123");
    });

    it("repassa todos os campos ao insert do Supabase", async () => {
      await sendContactAction(validData);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validData.name,
          email: validData.email,
          project_type: validData.project_type,
          description: validData.description,
          phone: null,
          whatsapp_preferred: false,
        })
      );
    });

    it("repassa phone e whatsapp_preferred quando fornecidos", async () => {
      await sendContactAction({ ...validData, phone: "11999999999", whatsapp_preferred: true });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "11999999999", whatsapp_preferred: true })
      );
    });
  });

  describe("erro do Supabase", () => {
    it("retorna error quando Supabase retorna error", async () => {
      mockInsert.mockResolvedValue({ error: { code: "23505" } });
      const result = await sendContactAction(validData);
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.message).toMatch(/não foi possível/i);
    });
  });

  describe("notificação WhatsApp", () => {
    it("chama notifyWhatsApp após insert bem-sucedido", async () => {
      await sendContactAction(validData);
      expect(mockAfter).toHaveBeenCalled();
      expect(mockNotifyWhatsApp).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validData.name,
          email: validData.email,
          project_type: validData.project_type,
          description: validData.description,
        })
      );
    });

    it("inclui timestamp na notificação", async () => {
      await sendContactAction(validData);
      expect(mockNotifyWhatsApp).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: expect.any(String) })
      );
    });

    it("não chama notifyWhatsApp quando Supabase retorna erro", async () => {
      mockInsert.mockResolvedValue({ error: { code: "23505" } });
      await sendContactAction(validData);
      expect(mockNotifyWhatsApp).not.toHaveBeenCalled();
    });
  });
});
