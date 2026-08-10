const mockGenerateContent = jest.fn();

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

import { translateFeedback } from "@/lib/admin/translate-feedback";

describe("translateFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna null quando GOOGLE_AI_API_KEY não está definida", async () => {
    const original = process.env.GOOGLE_AI_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;
    const result = await translateFeedback("Hello", "en");
    expect(result).toBeNull();
    process.env.GOOGLE_AI_API_KEY = original;
  });

  describe("com GOOGLE_AI_API_KEY definida", () => {
    beforeEach(() => {
      process.env.GOOGLE_AI_API_KEY = "test-api-key";
    });

    afterEach(() => {
      delete process.env.GOOGLE_AI_API_KEY;
    });

    it("retorna traduções quando a API retorna JSON válido", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '{"pt": "Olá", "es": "Hola"}' },
      });
      const result = await translateFeedback("Hello", "en");
      expect(result).toEqual({ pt: "Olá", es: "Hola" });
    });

    it("extrai JSON mesmo com texto extra ao redor", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Aqui está: {"pt": "Oi"} pronto.' },
      });
      const result = await translateFeedback("Hi", "en");
      expect(result).toEqual({ pt: "Oi" });
    });

    it("retorna null quando a API lança exceção", async () => {
      mockGenerateContent.mockRejectedValue(new Error("API error"));
      const result = await translateFeedback("Hello", "en");
      expect(result).toBeNull();
    });

    it("retorna null quando a resposta não contém JSON", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => "não é JSON válido" },
      });
      const result = await translateFeedback("Hello", "en");
      expect(result).toBeNull();
    });

    it("chama generateContent com o texto a ser traduzido", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '{"pt": "Ótimo produto!"}' },
      });
      await translateFeedback("Great product!", "en");
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining("Great product!")
      );
    });

    it("não inclui o locale de origem como alvo de tradução", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '{"en": "Hello", "es": "Hola"}' },
      });
      await translateFeedback("Olá", "pt");
      const prompt = mockGenerateContent.mock.calls[0][0] as string;
      expect(prompt).not.toContain('"pt": "Brazilian Portuguese"');
    });
  });
});
