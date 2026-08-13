const mockCreate = jest.fn();

jest.mock("@anthropic-ai/sdk", () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

jest.mock("@/lib/ai/router", () => ({
  anthropic: { messages: { create: mockCreate } },
  routeModel: jest.fn().mockReturnValue("claude-sonnet-4-5"),
}));

import { runAgent } from "@/lib/ai/agent";

const noopExecute = jest.fn();

describe("runAgent", () => {
  afterEach(() => jest.clearAllMocks());

  it("retorna texto quando stop_reason é end_turn", async () => {
    mockCreate.mockResolvedValueOnce({
      stop_reason: "end_turn",
      usage: { input_tokens: 10, output_tokens: 5 },
      content: [{ type: "text", text: "resposta final" }],
    });

    const result = await runAgent("system", "mensagem", [], noopExecute);

    expect(result.text).toBe("resposta final");
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 5 });
  });

  it("executa tool e continua loop quando stop_reason é tool_use", async () => {
    mockCreate
      .mockResolvedValueOnce({
        stop_reason: "tool_use",
        usage: { input_tokens: 10, output_tokens: 5 },
        content: [{ type: "tool_use", id: "tu_1", name: "minhaFerramenta", input: { x: 1 } }],
      })
      .mockResolvedValueOnce({
        stop_reason: "end_turn",
        usage: { input_tokens: 8, output_tokens: 3 },
        content: [{ type: "text", text: "após tool" }],
      });

    noopExecute.mockResolvedValueOnce({ resultado: "ok" });

    const result = await runAgent("system", "mensagem", [], noopExecute);

    expect(noopExecute).toHaveBeenCalledWith("minhaFerramenta", { x: 1 });
    expect(result.text).toBe("após tool");
    expect(result.usage).toEqual({ inputTokens: 18, outputTokens: 8 });
  });

  it("lança erro ao atingir MAX_ITERATIONS", async () => {
    mockCreate.mockResolvedValue({
      stop_reason: "tool_use",
      usage: { input_tokens: 1, output_tokens: 1 },
      content: [{ type: "tool_use", id: "tu_1", name: "tool", input: {} }],
    });
    noopExecute.mockResolvedValue({});

    await expect(runAgent("system", "mensagem", [], noopExecute)).rejects.toThrow(
      "max_iterations atingido",
    );
  });
});
