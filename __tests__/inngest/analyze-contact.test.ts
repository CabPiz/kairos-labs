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

import { fetchContactFromDB, saveContactAnalysis, analyzeContact } from "@/inngest/functions/analyze-contact";

const contactRow = { id: "c-1", description: "Quero contratar o serviço", name: "João", project_type: "web" };
const contactAnalysis = { intencao: "compra" as const, urgencia: "alta" as const, resumo: "Lead qualificado" };

function setupFetchMock() {
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: contactRow, error: null }),
      }),
    }),
  });
}

function setupSaveMock() {
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockResolvedValue({ error: null }),
  });
}

describe("fetchContactFromDB", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna os dados do contato quando encontrado", async () => {
    setupFetchMock();
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
  beforeEach(() => jest.clearAllMocks());

  it("insere na tabela contact_analysis com os campos corretos", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await saveContactAnalysis("c-1", contactAnalysis);

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

    await expect(saveContactAnalysis("c-1", contactAnalysis)).rejects.toThrow("Erro ao salvar análise de contato");
  });
});

describe("analyzeContact — handler", () => {
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
    mockExtractStructured.mockResolvedValue(contactAnalysis);
  });

  async function runHandler() {
    setupFetchMock();
    setupSaveMock();
    await (analyzeContact as unknown as (args: unknown) => Promise<void>)({
      event: { data: { contactId: "c-1" } },
      step,
    });
  }

  it("executa os três steps na ordem correta", async () => {
    await runHandler();
    expect(step.run).toHaveBeenCalledTimes(3);
    expect(step.run).toHaveBeenNthCalledWith(1, "fetch-contact", expect.any(Function));
    expect(step.run).toHaveBeenNthCalledWith(2, "run-contact-agent", expect.any(Function));
    expect(step.run).toHaveBeenNthCalledWith(3, "save-analysis", expect.any(Function));
  });

  it("sanitiza a descrição do contato antes de chamar o agente", async () => {
    await runHandler();
    expect(mockSanitizeInput).toHaveBeenCalledWith(contactRow.description);
  });

  it("chama tracedLLMCall com agentName correto", async () => {
    await runHandler();
    expect(mockTracedLLMCall).toHaveBeenCalledWith(
      expect.objectContaining({ agentName: "contact-analyzer" }),
      expect.any(Function),
    );
  });

  it("passa o resultado da análise para saveContactAnalysis", async () => {
    setupFetchMock();
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValueOnce({ insert: mockInsert });

    await (analyzeContact as unknown as (args: unknown) => Promise<void>)({
      event: { data: { contactId: "c-1" } },
      step,
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact_request_id: "c-1" }),
    );
  });
});
