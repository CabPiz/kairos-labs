import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, routeModel } from "./router";

/**
 * Envia um prompt ao modelo e extrai um output estruturado validado pelo schema Zod.
 * Usa tool forcing para garantir que o modelo preencha o schema exato.
 * @throws {Error} Se o modelo não retornar um tool_use com o schema esperado.
 */
export async function extractStructured<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  schemaName: string,
): Promise<T> {
  const response = await anthropic.messages.create({
    model: routeModel("analysis"),
    max_tokens: 2048,
    tools: [
      {
        name: schemaName,
        description: `Extrair ${schemaName}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input_schema: zodToJsonSchema(schema as any) as Anthropic.Tool["input_schema"],
      },
    ],
    tool_choice: { type: "tool", name: schemaName },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("LLM não retornou structured output");
  }
  return schema.parse(toolUse.input);
}
