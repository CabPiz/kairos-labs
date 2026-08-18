import { z } from "zod";

export const IssueDraftSchema = z.object({
  classification: z.enum(["bug", "improvement", "feature", "out-of-scope"]),
  title: z.string().min(1),
  body: z.string().min(1),
  labels: z.array(z.string()),
  milestone: z.string().optional(),
});

export type IssueDraft = z.infer<typeof IssueDraftSchema>;
