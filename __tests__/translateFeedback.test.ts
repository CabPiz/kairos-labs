const mockGenerateContent = jest.fn();

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

import { translateFeedbacksForDisplay } from "@/lib/admin/translate-feedback";

const ptFeedback = { id: "fb-pt", mensagem: "Ótimo produto!", mensagem_locale: "pt" as const };
const enFeedback = { id: "fb-en", mensagem: "Great product!", mensagem_locale: "en" as const };

describe("translateFeedbacksForDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna Map vazio quando GOOGLE_AI_API_KEY não está definida", async () => {
    const original = process.env.GOOGLE_AI_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;
    const result = await translateFeedbacksForDisplay([ptFeedback], "en");
    expect(result.size).toBe(0);
    process.env.GOOGLE_AI_API_KEY = original;
  });

  it("retorna Map vazio quando a lista de feedbacks está vazia", async () => {
    process.env.GOOGLE_AI_API_KEY = "test-key";
    const result = await translateFeedbacksForDisplay([], "en");
    expect(result.size).toBe(0);
    expect(mockGenerateContent).not.toHaveBeenCalled();
    delete process.env.GOOGLE_AI_API_KEY;
  });

  it("retorna Map vazio e não chama Gemini quando todos os feedbacks já estão no locale alvo", async () => {
    process.env.GOOGLE_AI_API_KEY = "test-key";
    const result = await translateFeedbacksForDisplay([enFeedback], "en");
    expect(result.size).toBe(0);
    expect(mockGenerateContent).not.toHaveBeenCalled();
    delete process.env.GOOGLE_AI_API_KEY;
  });

  describe("com GOOGLE_AI_API_KEY definida", () => {
    beforeEach(() => {
      process.env.GOOGLE_AI_API_KEY = "test-api-key";
    });

    afterEach(() => {
      delete process.env.GOOGLE_AI_API_KEY;
    });

    it("retorna Map com tradução quando a API retorna JSON válido", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '{"fb-pt": "Great product!"}' },
      });
      const result = await translateFeedbacksForDisplay([ptFeedback], "en");
      expect(result.get("fb-pt")).toBe("Great product!");
    });

    it("extrai JSON mesmo com texto extra ao redor", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Aqui está: {"fb-pt": "Great!"} pronto.' },
      });
      const result = await translateFeedbacksForDisplay([ptFeedback], "en");
      expect(result.get("fb-pt")).toBe("Great!");
    });

    it("retorna Map vazio quando a API lança exceção", async () => {
      mockGenerateContent.mockRejectedValue(new Error("API error"));
      const result = await translateFeedbacksForDisplay([ptFeedback], "en");
      expect(result.size).toBe(0);
    });

    it("retorna Map vazio quando a resposta não contém JSON", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => "não é JSON válido" },
      });
      const result = await translateFeedbacksForDisplay([ptFeedback], "en");
      expect(result.size).toBe(0);
    });

    it("inclui o texto dos feedbacks no prompt enviado ao Gemini", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '{"fb-pt": "Great!"}' },
      });
      await translateFeedbacksForDisplay([ptFeedback], "en");
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining("Ótimo produto!")
      );
    });

    it.each([
      ["pt", "Brazilian Portuguese"],
      ["es", "Spanish"],
    ] as const)(
      "inclui o nome do locale alvo '%s' no prompt",
      async (locale, localeName) => {
        mockGenerateContent.mockResolvedValue({
          response: { text: () => `{"fb-en": "translated"}` },
        });
        await translateFeedbacksForDisplay([enFeedback], locale);
        const prompt = mockGenerateContent.mock.calls[0][0] as string;
        expect(prompt).toContain(localeName);
      }
    );

    it("filtra feedbacks no locale alvo e traduz apenas os demais", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '{"fb-pt": "Great!"}' },
      });
      const result = await translateFeedbacksForDisplay([ptFeedback, enFeedback], "en");
      const prompt = mockGenerateContent.mock.calls[0][0] as string;
      expect(prompt).toContain("fb-pt");
      expect(prompt).not.toContain("fb-en");
      expect(result.get("fb-pt")).toBe("Great!");
    });

    it("inclui feedbacks com mensagem_locale null na tradução", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '{"fb-null": "Translated!"}' },
      });
      const result = await translateFeedbacksForDisplay(
        [{ id: "fb-null", mensagem: "Texto sem locale", mensagem_locale: null }],
        "en"
      );
      expect(result.get("fb-null")).toBe("Translated!");
    });
  });
});
