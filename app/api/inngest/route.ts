import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { analyzeContact } from "@/inngest/functions/analyze-contact";
import { analyzeFeedback } from "@/inngest/functions/analyze-feedback";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeContact, analyzeFeedback],
});
