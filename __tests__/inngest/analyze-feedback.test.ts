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

import { fetchFeedbackFromDB, saveFeedbackAnalysis } from "@/inngest/functions/analyze-feedback";

const feedbackRow = { id: "fb-1", mensagem: "O produto é excelente!", product_id: "devprint" };

describe("fetchFeedbackFromDB", () => {
  it("retorna os dados do feedback quando encontrado", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: feedbackRow, error: null }),
        }),
      }),
    });

    const result = await fetchFeedbackFromDB("fb-1");
    expect(result).toEqual(feedbackRow);
    expect(mockFrom).toHaveBeenCalledWith("feedback");
  });

  it("lança erro quando o feedback não é encontrado", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
        }),
      }),
    });

    await expect(fetchFeedbackFromDB("inexistente")).rejects.toThrow("Feedback não encontrado");
  });
});

describe("saveFeedbackAnalysis", () => {
  const analysis = {
    sentimento: "positivo" as const,
    categoria: "elogio",
    resumo: "Usuário satisfeito",
    pontuacao: 9,
  };

  it("atualiza o feedback com os campos de análise corretos", async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await saveFeedbackAnalysis("fb-1", analysis);

    expect(mockFrom).toHaveBeenCalledWith("feedback");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis_status: "done",
        sentiment_analysis: analysis,
      }),
    );
  });

  it("lança erro quando o update falha", async () => {
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: "db error" } }),
      }),
    });

    await expect(saveFeedbackAnalysis("fb-1", analysis)).rejects.toThrow("Erro ao salvar análise de feedback");
  });
});
