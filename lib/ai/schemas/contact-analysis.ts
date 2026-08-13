import { z } from "zod";

export const ContactAnalysisSchema = z.object({
  intencao: z.enum(["compra", "suporte", "parceria", "outro"]),
  urgencia: z.enum(["alta", "media", "baixa"]),
  resumo: z.string(),
});

export type ContactAnalysis = z.infer<typeof ContactAnalysisSchema>;
