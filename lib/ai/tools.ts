import type { Tool } from "@anthropic-ai/sdk/resources";

export type { Tool };

/** Cria uma definição de tool compatível com o Anthropic SDK. */
export function defineTool(
  name: string,
  description: string,
  inputSchema: Tool["input_schema"],
): Tool {
  return { name, description, input_schema: inputSchema };
}

export const CONTACT_SYSTEM_PROMPT =
  "Você é um assistente de análise de solicitações de contato da Kairos Labs. " +
  "Analise a mensagem do lead e produza uma análise textual descrevendo a intenção " +
  "principal (compra, suporte, parceria ou outro), o nível de urgência (alta, média " +
  "ou baixa) e um resumo objetivo. Baseie-se apenas no texto fornecido.";

export const contactAgentTools: Tool[] = [];

/**
 * Dispatcher de tools para o agente de análise de contatos.
 * Nenhuma tool está disponível — lança erro se chamado.
 */
export async function executeContactTool(name: string, _input: unknown): Promise<unknown> {
  throw new Error(`Tool desconhecida para agente de contato: ${name}`);
}

export const FEEDBACK_SYSTEM_PROMPT =
  "Você é um assistente de análise de feedback de produto da Kairos Labs. " +
  "Analise o feedback do usuário e produza uma análise textual descrevendo o sentimento " +
  "(positivo, neutro ou negativo), a categoria do feedback e um resumo objetivo. " +
  "Baseie-se apenas no texto fornecido.";

export const feedbackAgentTools: Tool[] = [];

/**
 * Dispatcher de tools para o agente de análise de feedback.
 * Nenhuma tool está disponível — lança erro se chamado.
 */
export async function executeFeedbackTool(name: string, _input: unknown): Promise<unknown> {
  throw new Error(`Tool desconhecida para agente de feedback: ${name}`);
}
