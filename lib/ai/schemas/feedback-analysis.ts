import { z } from "zod";

export const FeedbackAnalysisSchema = z.object({
  sentimento: z.enum(["positivo", "neutro", "negativo"]),
  categoria: z.string(),
  resumo: z.string(),
  pontuacao: z.number().min(0).max(10),
});

export type FeedbackAnalysis = z.infer<typeof FeedbackAnalysisSchema>;
