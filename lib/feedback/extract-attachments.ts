import "server-only";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (data: Buffer) => Promise<{ text: string }>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth") as { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }> };

type AttachmentMeta = {
  readonly filename: string;
  readonly mime_type: string;
};

export type ExtractedText = { readonly kind: "text"; readonly filename: string; readonly content: string };
export type ExtractedImage = { readonly kind: "image"; readonly filename: string; readonly base64: string; readonly mimeType: "image/png" | "image/jpeg" };
export type ExtractedAttachment = ExtractedText | ExtractedImage;

/**
 * Extrai conteúdo textual ou base64 de um buffer de arquivo conforme o mime_type.
 * PDF e DOCX → texto; TXT → texto direto; PNG/JPG → base64 para vision.
 */
export async function extractAttachment(
  meta: AttachmentMeta,
  buffer: Buffer,
): Promise<ExtractedAttachment> {
  const { filename, mime_type } = meta;

  if (mime_type === "application/pdf") {
    const parsed = await pdfParse(buffer);
    return { kind: "text", filename, content: parsed.text.trim() };
  }

  if (mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return { kind: "text", filename, content: result.value.trim() };
  }

  if (mime_type === "text/plain") {
    return { kind: "text", filename, content: buffer.toString("utf-8").trim() };
  }

  if (mime_type === "image/png" || mime_type === "image/jpeg") {
    return {
      kind: "image",
      filename,
      base64: buffer.toString("base64"),
      mimeType: mime_type as "image/png" | "image/jpeg",
    };
  }

  return { kind: "text", filename, content: "" };
}
