import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/** Custo por milhão de tokens (USD) por modelo. */
const COST_PER_M: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-5": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.25, output: 1.25 },
};

export interface RunOptions {
  agentName: string;
  model: string;
  toolsCalled?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Envolve uma chamada ao LLM com logging automático na tabela `agent_runs`.
 * Registra tokens, custo estimado, latência e status (success ou error).
 * @param options - Identificação do agente, modelo e metadados opcionais.
 * @param fn - Função que executa a chamada ao LLM e retorna `{ result, inputTokens, outputTokens }`.
 * @returns O valor de `result` retornado por `fn`.
 * @throws Repropaga qualquer erro lançado por `fn` após gravar o registro de erro.
 */
export async function tracedLLMCall<T>(
  options: RunOptions,
  fn: () => Promise<{ result: T; inputTokens: number; outputTokens: number }>,
): Promise<T> {
  const start = Date.now();
  try {
    const { result, inputTokens, outputTokens } = await fn();
    const pricing = COST_PER_M[options.model] ?? { input: 3, output: 15 };
    const estimatedCostUsd =
      (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;

    await supabase.from("agent_runs").insert({
      agent_name: options.agentName,
      model: options.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost_usd: estimatedCostUsd,
      latency_ms: Date.now() - start,
      tools_called: options.toolsCalled ?? [],
      status: "success",
      metadata: options.metadata ?? {},
    });

    return result;
  } catch (err) {
    await supabase.from("agent_runs").insert({
      agent_name: options.agentName,
      model: options.model,
      latency_ms: Date.now() - start,
      status: "error",
      error_message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
