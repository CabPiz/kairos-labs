import { tracedLLMCall } from "@/lib/ai/observe";

describe("tracedLLMCall", () => {
  it("retorna o resultado da função passada", async () => {
    const result = await tracedLLMCall("test", async () => "valor");
    expect(result).toBe("valor");
  });

  it("propaga erro se a função lançar", async () => {
    await expect(
      tracedLLMCall("test", async () => {
        throw new Error("erro interno");
      }),
    ).rejects.toThrow("erro interno");
  });
});
