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
