import { z } from "zod";

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

import { extractStructured } from "@/lib/ai/structured";

const TestSchema = z.object({ nome: z.string(), valor: z.number() });

describe("extractStructured", () => {
  it("retorna dados validados quando o modelo retorna tool_use", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        { type: "tool_use", id: "tu_1", name: "TestSchema", input: { nome: "ok", valor: 42 } },
      ],
    });

    const result = await extractStructured("prompt", TestSchema, "TestSchema");
    expect(result).toEqual({ nome: "ok", valor: 42 });
  });

  it("lança erro quando o modelo não retorna tool_use", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "resposta sem tool" }],
    });

    await expect(
      extractStructured("prompt", TestSchema, "TestSchema"),
    ).rejects.toThrow("LLM não retornou structured output");
  });
});
