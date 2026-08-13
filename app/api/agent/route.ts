import { anthropic } from "@/lib/ai/router";

/**
 * POST /api/agent — streaming de texto do modelo via ReadableStream.
 * Body: { message: string }
 */
export async function POST(req: Request) {
  const { message } = (await req.json()) as { message: string };

  const stream = new ReadableStream({
    async start(controller) {
      const response = anthropic.messages.stream({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        messages: [{ role: "user", content: message }],
      });

      for await (const chunk of response) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
