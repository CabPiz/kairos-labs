import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Locale } from "@/i18n/routing";

const localeNames: Record<Locale, string> = {
  pt: "Brazilian Portuguese",
  en: "English",
  es: "Spanish",
};

/**
 * Traduz em lote os feedbacks exibidos no painel admin para o locale do administrador.
 * Faz uma única chamada ao Gemini 2.0 Flash (free tier) com todos os textos que precisam
 * de tradução. Feedbacks cujo locale já é o locale alvo são filtrados antes da chamada.
 * Retorna Map vazio se a API key não estiver configurada ou se a chamada falhar —
 * o chamador exibe o texto original como fallback.
 *
 * @param feedbacks - Feedbacks a exibir no admin (id, mensagem, mensagem_locale)
 * @param targetLocale - Locale em que o admin está visualizando o dashboard
 * @returns Map de id → texto traduzido; ids ausentes usam o texto original como fallback
 */
export async function translateFeedbacksForDisplay(
  feedbacks: Array<{ id: string; mensagem: string; mensagem_locale: string | null }>,
  targetLocale: Locale
): Promise<Map<string, string>> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey || feedbacks.length === 0) return new Map();

  const toTranslate = feedbacks.filter((f) => f.mensagem_locale !== targetLocale);
  if (toTranslate.length === 0) return new Map();

  try {
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const messagesObj: Record<string, string> = {};
    for (const f of toTranslate) {
      messagesObj[f.id] = f.mensagem;
    }

    const prompt = `Translate each of the following product feedback messages to ${localeNames[targetLocale]}.
Return ONLY a valid JSON object where each key is the feedback ID and the value is the translated text.
Preserve technical terms, product names, and URLs exactly.
If a message is already in ${localeNames[targetLocale]}, return it unchanged.

Messages (JSON object with id → text):
${JSON.stringify(messagesObj)}

Respond with only the JSON object, no markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return new Map();

    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, string>;
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}
