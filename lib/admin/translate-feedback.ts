import { GoogleGenerativeAI } from "@google/generative-ai";
import { locales, type Locale } from "@/i18n/routing";

const localeNames: Record<Locale, string> = {
  pt: "Brazilian Portuguese",
  en: "English",
  es: "Spanish",
};

/**
 * Traduz o texto de feedback para todos os locales suportados via Gemini 2.0 Flash (free tier).
 * Retorna null se a tradução falhar — o feedback original é preservado pelo chamador.
 *
 * @param mensagem - Texto original do feedback
 * @param sourceLocale - Locale de origem (idioma em que o texto foi escrito)
 * @returns Objeto com traduções por locale, ou null em caso de falha
 */
export async function translateFeedback(
  mensagem: string,
  sourceLocale: Locale
): Promise<Partial<Record<Locale, string>> | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  const targetLocales = locales.filter((l) => l !== sourceLocale);
  if (targetLocales.length === 0) return null;

  try {
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const targetList = targetLocales.map((l) => `"${l}": "${localeNames[l]}"`).join(", ");
    const prompt = `Translate the following product feedback text to the specified languages.
Return ONLY a valid JSON object with locale codes as keys. Preserve technical terms, product names, and URLs exactly.

Source language: ${localeNames[sourceLocale]}
Target languages: { ${targetList} }

Text to translate:
${mensagem}

Respond with only the JSON object, no markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as Partial<Record<Locale, string>>;
  } catch {
    return null;
  }
}
