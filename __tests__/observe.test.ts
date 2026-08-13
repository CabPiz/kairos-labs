const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

import { tracedLLMCall } from "@/lib/ai/observe";
import type { RunOptions } from "@/lib/ai/observe";

const baseOptions: RunOptions = {
  agentName: "test-agent",
  model: "claude-sonnet-4-5",
};

describe("tracedLLMCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("retorna o resultado da função", async () => {
    const result = await tracedLLMCall(baseOptions, async () => ({
      result: "resposta do agente",
      inputTokens: 100,
      outputTokens: 50,
    }));
    expect(result).toBe("resposta do agente");
  });

  it("grava em agent_runs com status success no caminho feliz", async () => {
    await tracedLLMCall(baseOptions, async () => ({
      result: "ok",
      inputTokens: 200,
      outputTokens: 100,
    }));

    expect(mockFrom).toHaveBeenCalledWith("agent_runs");
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.status).toBe("success");
    expect(insertArg.agent_name).toBe("test-agent");
    expect(insertArg.model).toBe("claude-sonnet-4-5");
    expect(insertArg.input_tokens).toBe(200);
    expect(insertArg.output_tokens).toBe(100);
    expect(typeof insertArg.latency_ms).toBe("number");
  });

  it("calcula custo estimado corretamente para sonnet-4-5", async () => {
    // 1_000_000 input tokens a $3/M + 1_000_000 output tokens a $15/M = $18
    await tracedLLMCall(baseOptions, async () => ({
      result: "ok",
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
    }));

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.estimated_cost_usd).toBeCloseTo(18, 6);
  });

  it("calcula custo estimado corretamente para haiku-4-5", async () => {
    // 1_000_000 input a $0.25/M + 1_000_000 output a $1.25/M = $1.50
    await tracedLLMCall(
      { ...baseOptions, model: "claude-haiku-4-5-20251001" },
      async () => ({ result: "ok", inputTokens: 1_000_000, outputTokens: 1_000_000 }),
    );

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.estimated_cost_usd).toBeCloseTo(1.5, 6);
  });

  it("usa fallback de custo para modelo desconhecido", async () => {
    // Fallback: input=$3/M, output=$15/M — mesmo que sonnet
    await tracedLLMCall(
      { ...baseOptions, model: "modelo-desconhecido" },
      async () => ({ result: "ok", inputTokens: 1_000_000, outputTokens: 1_000_000 }),
    );

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.estimated_cost_usd).toBeCloseTo(18, 6);
  });

  it("inclui tools_called quando fornecido", async () => {
    await tracedLLMCall(
      { ...baseOptions, toolsCalled: ["get_product_context", "list_feedbacks"] },
      async () => ({ result: "ok", inputTokens: 10, outputTokens: 5 }),
    );

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.tools_called).toEqual(["get_product_context", "list_feedbacks"]);
  });

  it("usa array vazio para tools_called quando não fornecido", async () => {
    await tracedLLMCall(baseOptions, async () => ({
      result: "ok",
      inputTokens: 10,
      outputTokens: 5,
    }));

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.tools_called).toEqual([]);
  });

  it("grava em agent_runs com status error quando fn lança exceção", async () => {
    const erro = new Error("falha na chamada ao LLM");

    await expect(
      tracedLLMCall(baseOptions, async () => {
        throw erro;
      }),
    ).rejects.toThrow("falha na chamada ao LLM");

    expect(mockFrom).toHaveBeenCalledWith("agent_runs");
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.status).toBe("error");
    expect(insertArg.error_message).toBe("falha na chamada ao LLM");
    expect(typeof insertArg.latency_ms).toBe("number");
  });

  it("repropaga o erro original após gravar o registro de erro", async () => {
    const erroOriginal = new Error("erro original");

    await expect(
      tracedLLMCall(baseOptions, async () => {
        throw erroOriginal;
      }),
    ).rejects.toBe(erroOriginal);
  });

  it("serializa erro não-Error como string no error_message", async () => {
    await expect(
      tracedLLMCall(baseOptions, async () => {
        throw "string de erro";
      }),
    ).rejects.toBe("string de erro");

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.error_message).toBe("string de erro");
  });
});
