const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { sendContactAction } from "@/components/contact/contact-action";

const validData = {
  name: "César Pizarro",
  email: "cesar@exemplo.com",
  project_type: "Desenvolvimento Web",
  description: "Preciso de um sistema de gestão completo para minha empresa.",
};

describe("sendContactAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
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
    it.each([
      "Desenvolvimento Web",
      "IA & Automação",
      "Consultoria Técnica",
      "Outro",
    ])("insere no Supabase com tipo de projeto '%s'", async (project_type) => {
      const result = await sendContactAction({ ...validData, project_type });
      expect(result.status).toBe("success");
      expect(mockFrom).toHaveBeenCalledWith("contact_requests");
    });

    it("repassa todos os campos ao insert do Supabase", async () => {
      await sendContactAction(validData);
      expect(mockInsert).toHaveBeenCalledWith({
        name: validData.name,
        email: validData.email,
        project_type: validData.project_type,
        description: validData.description,
      });
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
});
