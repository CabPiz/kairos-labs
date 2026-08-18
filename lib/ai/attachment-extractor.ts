export interface ExtractedAttachment {
  filename: string
  /** Texto extraído do arquivo. Para imagens, descreve o encoding. */
  content: string
  /** Presente apenas para imagens — MIME type original. */
  mediaType?: string
  /** Presente apenas para imagens — conteúdo em base64 sem prefixo data:. */
  base64Data?: string
}

/**
 * Faz download de um anexo via signed URL e extrai seu conteúdo textual.
 * - PDF: extrai texto via `pdf-parse`
 * - DOCX: extrai texto via `mammoth`
 * - TXT: leitura direta como UTF-8
 * - PNG/JPG: converte para base64 para envio como vision block
 *
 * @param signedUrl - URL assinada temporária do Supabase Storage
 * @param filename - Nome original do arquivo (para identificação no prompt)
 * @param mimeType - MIME type declarado no momento do upload
 */
export async function extractAttachmentContent(
  signedUrl: string,
  filename: string,
  mimeType: string,
): Promise<ExtractedAttachment> {
  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`Falha ao baixar anexo ${filename}: HTTP ${response.status}`);
  }

  if (mimeType === "application/pdf") {
    const buffer = Buffer.from(await response.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const result = await pdfParse(buffer);
    return { filename, content: result.text };
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const buffer = Buffer.from(await response.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { filename, content: result.value };
  }

  if (mimeType === "text/plain") {
    const text = await response.text();
    return { filename, content: text };
  }

  if (mimeType.startsWith("image/")) {
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64Data = buffer.toString("base64");
    return {
      filename,
      content: `[Imagem: ${filename}]`,
      mediaType: mimeType,
      base64Data,
    };
  }

  return { filename, content: `[Tipo não suportado: ${mimeType}]` };
}
