import { createServerAdminClient } from "@/lib/supabase-server";

export type PipelineStep =
  | "fetch-contact"
  | "extract-attachments"
  | "upsert-analyzing"
  | "run-product-agent"
  | "save-analysis"
  | "pipeline-error";

export type PipelineStatus = "start" | "success" | "error";

/**
 * Registra um evento do pipeline de análise na tabela `pipeline_logs`.
 * Nunca lança exceção — logging nunca deve quebrar o fluxo principal.
 */
export async function logPipelineEvent(
  contactRequestId: string,
  stepName: PipelineStep,
  status: PipelineStatus,
  options?: {
    message?: string;
    metadata?: Record<string, unknown>;
    durationMs?: number;
  },
): Promise<void> {
  const label = `[pipeline:${stepName}:${status}]`;
  console.log(label, options?.message ?? "", options?.metadata ?? "");

  try {
    const supabase = createServerAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("pipeline_logs").insert({
      contact_request_id: contactRequestId,
      step_name: stepName,
      status,
      message: options?.message ?? null,
      metadata: options?.metadata ?? {},
      duration_ms: options?.durationMs ?? null,
    });
    if (error) console.error(label, "db write failed:", error.message);
  } catch (err) {
    console.error(label, "unexpected error:", err);
  }
}
