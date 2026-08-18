import type { Tool, MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources";
import { anthropic, routeModel } from "./router";

const MAX_ITERATIONS = 10;

/**
 * Executa um agente ReAct com suporte a tool calling.
 * Itera até `MAX_ITERATIONS` rodadas de LLM → tool → resultado.
 * @throws {Error} Se `MAX_ITERATIONS` for atingido sem `end_turn`.
 */
export async function runAgent(
  systemPrompt: string,
  userMessage: string,
  tools: Tool[],
  executeTool: (name: string, input: unknown) => Promise<unknown>,
): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
  const messages: MessageParam[] = [{ role: "user", content: userMessage }];
  let totalInput = 0;
  let totalOutput = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: routeModel("analysis"),
      max_tokens: 4096,
      system: systemPrompt,
      ...(tools.length > 0 ? { tools } : {}),
      messages,
    });

    totalInput += response.usage.input_tokens;
    totalOutput += response.usage.output_tokens;

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
      return { text, usage: { inputTokens: totalInput, outputTokens: totalOutput } };
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: ToolResultBlockParam[] = await Promise.all(
        response.content
          .filter((b) => b.type === "tool_use")
          .map(async (b) => ({
            type: "tool_result" as const,
            tool_use_id: b.id,
            content: JSON.stringify(await executeTool(b.name, b.input)),
          })),
      );
      messages.push(
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      );
    }
  }

  throw new Error("max_iterations atingido");
}
