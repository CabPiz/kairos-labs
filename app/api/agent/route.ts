import { anthropic } from "@/lib/ai/router";
import {
  checkRateLimit,
  sanitizeInput,
  withTimeout,
  RateLimitError,
  ValidationError,
} from "@/lib/ai/guardrails";

/**
 * POST /api/agent — streaming de texto do modelo via ReadableStream.
 * Body: { message: string }
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  try {
    checkRateLimit(ip);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return Response.json({ error: "Muitas requisições" }, { status: 429 });
    }
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }

  let message: string;
  try {
    const body = (await req.json()) as { message?: string };
    message = sanitizeInput(body.message ?? "");
  } catch (err) {
    if (err instanceof ValidationError) {
      return Response.json({ error: "Input inválido" }, { status: 400 });
    }
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = anthropic.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 2048,
          messages: [{ role: "user", content: message }],
        });

        await withTimeout(
          (async () => {
            for await (const chunk of response) {
              if (
                chunk.type === "content_block_delta" &&
                chunk.delta.type === "text_delta"
              ) {
                controller.enqueue(new TextEncoder().encode(chunk.delta.text));
              }
            }
          })(),
        );

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
