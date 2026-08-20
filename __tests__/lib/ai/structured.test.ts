import { z } from "zod";

const mockGenerateObject = jest.fn();

jest.mock("ai", () => ({
  generateObject: (...args: unknown[]) => mockGenerateObject(...args),
}));

jest.mock("@ai-sdk/google", () => ({
  google: jest.fn().mockReturnValue({}),
}));

jest.mock("@anthropic-ai/sdk", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

import { extractStructured } from "@/lib/ai/structured";

const TestSchema = z.object({ nome: z.string(), valor: z.number() });

describe("extractStructured", () => {
  it("retorna dados validados quando o modelo retorna objeto estruturado", async () => {
    mockGenerateObject.mockResolvedValueOnce({ object: { nome: "ok", valor: 42 } });

    const result = await extractStructured("prompt", TestSchema);
    expect(result).toEqual({ nome: "ok", valor: 42 });
  });

  it("propaga erro quando generateObject lança", async () => {
    mockGenerateObject.mockRejectedValueOnce(new Error("API error"));

    await expect(
      extractStructured("prompt", TestSchema),
    ).rejects.toThrow("API error");
  });
});
