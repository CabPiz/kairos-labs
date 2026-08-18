const mockFrom = jest.fn();
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

jest.mock("@/lib/ai/agent", () => ({
  runAgent: jest.fn(),
}));

jest.mock("@/lib/ai/structured", () => ({
  extractStructured: jest.fn(),
}));

jest.mock("@/lib/ai/guardrails", () => ({
  sanitizeInput: jest.fn((s: string) => s),
}));

jest.mock("@/lib/ai/observe", () => ({
  tracedLLMCall: jest.fn(),
}));

jest.mock("@/inngest/client", () => ({
  inngest: { createFunction: jest.fn() },
}));

import { fetchContactFromDB, saveContactAnalysis } from "@/inngest/functions/analyze-contact";

const contactRow = { id: "c-1", description: "Quero contratar o serviço", name: "João", project_type: "web" };

describe("fetchContactFromDB", () => {
  it("retorna os dados do contato quando encontrado", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: contactRow, error: null }),
        }),
      }),
    });

    const result = await fetchContactFromDB("c-1");
    expect(result).toEqual(contactRow);
    expect(mockFrom).toHaveBeenCalledWith("contact_requests");
  });

  it("lança erro quando o contato não é encontrado", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
        }),
      }),
    });

    await expect(fetchContactFromDB("inexistente")).rejects.toThrow("Contato não encontrado");
  });
});

describe("saveContactAnalysis", () => {
  const analysis = { intencao: "compra" as const, urgencia: "alta" as const, resumo: "Lead qualificado" };

  it("insere na tabela contact_analysis com os campos corretos", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await saveContactAnalysis("c-1", analysis);

    expect(mockFrom).toHaveBeenCalledWith("contact_analysis");
    expect(mockInsert).toHaveBeenCalledWith({
      contact_request_id: "c-1",
      intencao: "compra",
      urgencia: "alta",
      resumo: "Lead qualificado",
    });
  });

  it("lança erro quando o insert falha", async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: { message: "db error" } }),
    });

    await expect(saveContactAnalysis("c-1", analysis)).rejects.toThrow("Erro ao salvar análise de contato");
  });
});
