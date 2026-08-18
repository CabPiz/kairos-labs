const mockFrom = jest.fn();
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

const mockRunAgent = jest.fn();
jest.mock("@/lib/ai/agent", () => ({
  runAgent: (...args: unknown[]) => mockRunAgent(...args),
}));

const mockExtractStructured = jest.fn();
jest.mock("@/lib/ai/structured", () => ({
  extractStructured: (...args: unknown[]) => mockExtractStructured(...args),
}));

const mockSanitizeInput = jest.fn((s: string) => s);
jest.mock("@/lib/ai/guardrails", () => ({
  sanitizeInput: (s: string) => mockSanitizeInput(s),
}));

const mockTracedLLMCall = jest.fn();
jest.mock("@/lib/ai/observe", () => ({
  tracedLLMCall: (...args: unknown[]) => mockTracedLLMCall(...args),
}));

jest.mock("@/inngest/client", () => ({
  inngest: {
    createFunction: jest.fn((_config: unknown, handler: unknown) => handler),
  },
}));

import { fetchFeedbackFromDB, saveFeedbackAnalysis, analyzeFeedback } from "@/inngest/functions/analyze-feedback";

const feedbackRow = { id: "fb-1", mensagem: "O produto é excelente!", product_id: "devprint" };
const feedbackAnalysis = {
  sentimento: "positivo" as const,
  categoria: "elogio",
  resumo: "Usuário satisfeito",
  pontuacao: 9,
};

function setupFetchMock() {
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: feedbackRow, error: null }),
      }),
    }),
  });
}

function setupSaveMock() {
  mockFrom.mockReturnValueOnce({
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }),
  });
}

describe("fetchFeedbackFromDB", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna os dados do feedback quando encontrado", async () => {
    setupFetchMock();
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
  beforeEach(() => jest.clearAllMocks());

  it("atualiza o feedback com os campos de análise corretos", async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await saveFeedbackAnalysis("fb-1", feedbackAnalysis);

    expect(mockFrom).toHaveBeenCalledWith("feedback");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis_status: "done",
        sentiment_analysis: feedbackAnalysis,
      }),
    );
  });

  it("lança erro quando o update falha", async () => {
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: "db error" } }),
      }),
    });

    await expect(saveFeedbackAnalysis("fb-1", feedbackAnalysis)).rejects.toThrow("Erro ao salvar análise de feedback");
  });
});

describe("analyzeFeedback — handler", () => {
  let step: { run: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    step = {
      run: jest.fn().mockImplementation((_name: string, fn: () => unknown) => fn()),
    };
    mockTracedLLMCall.mockImplementation(
      async (_opts: unknown, fn: () => Promise<{ result: unknown }>) => {
        const { result } = await fn();
        return result;
      },
    );
    mockRunAgent.mockResolvedValue({
      text: "texto de análise",
      usage: { inputTokens: 10, outputTokens: 20 },
    });
    mockExtractStructured.mockResolvedValue(feedbackAnalysis);
  });

  async function runHandler() {
    setupFetchMock();
    setupSaveMock();
    await (analyzeFeedback as unknown as (args: unknown) => Promise<void>)({
      event: { data: { feedbackId: "fb-1" } },
      step,
    });
  }

  it("executa os três steps na ordem correta", async () => {
    await runHandler();
    expect(step.run).toHaveBeenCalledTimes(3);
    expect(step.run).toHaveBeenNthCalledWith(1, "fetch-feedback", expect.any(Function));
    expect(step.run).toHaveBeenNthCalledWith(2, "run-feedback-agent", expect.any(Function));
    expect(step.run).toHaveBeenNthCalledWith(3, "save-analysis", expect.any(Function));
  });

  it("sanitiza a mensagem do feedback antes de chamar o agente", async () => {
    await runHandler();
    expect(mockSanitizeInput).toHaveBeenCalledWith(feedbackRow.mensagem);
  });

  it("chama tracedLLMCall com agentName correto", async () => {
    await runHandler();
    expect(mockTracedLLMCall).toHaveBeenCalledWith(
      expect.objectContaining({ agentName: "feedback-analyzer" }),
      expect.any(Function),
    );
  });

  it("passa o resultado da análise para saveFeedbackAnalysis", async () => {
    setupFetchMock();
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValueOnce({ update: mockUpdate });

    await (analyzeFeedback as unknown as (args: unknown) => Promise<void>)({
      event: { data: { feedbackId: "fb-1" } },
      step,
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ analysis_status: "done", sentiment_analysis: feedbackAnalysis }),
    );
  });
});
