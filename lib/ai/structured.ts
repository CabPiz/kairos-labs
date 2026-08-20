import { z } from "zod";
import { generateObject } from "ai";
import { analysisModel } from "./router";

/**
 * Envia um prompt ao modelo e extrai um output estruturado validado pelo schema Zod.
 * @throws {Error} Se o modelo não retornar o objeto estruturado esperado.
 */
export async function extractStructured<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const { object } = await generateObject({
    model: analysisModel,
    prompt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: schema as z.ZodSchema<any>,
  });
  return object as T;
}
