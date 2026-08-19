import { z } from "zod";

const IssueDraftSchema = z.object({
  title: z.string(),
  body: z.string(),
  labels: z.array(z.string()),
});

const NichoSchema = z.object({
  publico: z.string(),
  justificativa: z.string(),
});

export const ContactAnalysisSchema = z.object({
  problema: z.string(),
  solucao_tipo: z.enum(["novo_produto", "aprimoramento"]),
  solucao_titulo: z.string(),
  solucao_descricao: z.string(),
  nichos: z.array(NichoSchema).min(2),
  draft_issues: z.array(IssueDraftSchema).min(1),
});

export type ContactAnalysis = z.infer<typeof ContactAnalysisSchema>;
export type IssueDraft = z.infer<typeof IssueDraftSchema>;
export type Nicho = z.infer<typeof NichoSchema>;
