const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { joinWaitlistAction } from "@/components/waitlist/waitlist-action";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

describe("joinWaitlistAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  describe("validação Zod", () => {
    it("retorna erro quando e-mail está vazio", async () => {
      const fd = makeFormData({ email: "", product_id: "devprint" });
      const result = await joinWaitlistAction(fd);
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.message).toMatch(/e-mail é obrigatório/i);
      }
    });

    it.each([
      ["nao-e-email", "sem arroba"],
      ["user@nodot", "arroba sem ponto depois"],
    ])("retorna erro quando e-mail tem formato inválido (%s — %s)", async (email) => {
      const fd = makeFormData({ email, product_id: "devprint" });
      const result = await joinWaitlistAction(fd);
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.message).toMatch(/formato/i);
      }
    });

    it("retorna erro quando product_id não é válido", async () => {
      const fd = makeFormData({ email: "a@b.com", product_id: "invalido" });
      const result = await joinWaitlistAction(fd);
      expect(result.status).toBe("error");
    });
  });

  describe("sucesso", () => {
    it("insere no Supabase e retorna success com o e-mail", async () => {
      const fd = makeFormData({ email: "cesar@example.com", product_id: "devprint" });
      const result = await joinWaitlistAction(fd);
      expect(result.status).toBe("success");
      if (result.status === "success") {
        expect(result.email).toBe("cesar@example.com");
      }
      expect(mockFrom).toHaveBeenCalledWith("waitlist");
    });

    it.each([
      "devprint",
      "ai-saas",
      "audio-tech",
      "blockchain",
      "ascend",
      "elucya-talk",
      "agora-global",
      "kairos-labs",
    ])("aceita product_id válido: %s", async (product_id) => {
      const fd = makeFormData({ email: "test@test.com", product_id });
      const result = await joinWaitlistAction(fd);
      expect(result.status).toBe("success");
    });
  });

  describe("erros do Supabase", () => {
    it("retorna duplicate quando Supabase retorna código 23505", async () => {
      mockInsert.mockResolvedValue({ error: { code: "23505" } });
      const fd = makeFormData({ email: "dup@example.com", product_id: "devprint" });
      const result = await joinWaitlistAction(fd);
      expect(result.status).toBe("duplicate");
    });

    it("retorna error para outros erros do Supabase", async () => {
      mockInsert.mockResolvedValue({ error: { code: "50000", message: "internal" } });
      const fd = makeFormData({ email: "err@example.com", product_id: "devprint" });
      const result = await joinWaitlistAction(fd);
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.message).toMatch(/erro interno/i);
      }
    });
  });
});
