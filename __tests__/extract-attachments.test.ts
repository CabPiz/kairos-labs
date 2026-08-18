jest.mock("pdf-parse", () => jest.fn());
jest.mock("mammoth", () => ({ extractRawText: jest.fn() }));

import { extractAttachment } from "@/lib/feedback/extract-attachments";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockPdfParse = require("pdf-parse") as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockMammoth = require("mammoth") as { extractRawText: jest.Mock };

describe("extractAttachment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("extrai texto de PDF", async () => {
    mockPdfParse.mockResolvedValueOnce({ text: "  Conteúdo PDF  " });
    const result = await extractAttachment(
      { filename: "doc.pdf", mime_type: "application/pdf" },
      Buffer.from("data")
    );
    expect(result).toEqual({ kind: "text", filename: "doc.pdf", content: "Conteúdo PDF" });
  });

  it("extrai texto de DOCX", async () => {
    mockMammoth.extractRawText.mockResolvedValueOnce({ value: "  Conteúdo DOCX  " });
    const result = await extractAttachment(
      {
        filename: "doc.docx",
        mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      Buffer.from("data")
    );
    expect(result).toEqual({ kind: "text", filename: "doc.docx", content: "Conteúdo DOCX" });
  });

  it("extrai texto de TXT", async () => {
    const result = await extractAttachment(
      { filename: "file.txt", mime_type: "text/plain" },
      Buffer.from("  Conteúdo TXT  ")
    );
    expect(result).toEqual({ kind: "text", filename: "file.txt", content: "Conteúdo TXT" });
  });

  it("retorna base64 para PNG", async () => {
    const data = Buffer.from("png-bytes");
    const result = await extractAttachment({ filename: "img.png", mime_type: "image/png" }, data);
    expect(result).toEqual({
      kind: "image",
      filename: "img.png",
      base64: data.toString("base64"),
      mimeType: "image/png",
    });
  });

  it("retorna base64 para JPEG", async () => {
    const data = Buffer.from("jpg-bytes");
    const result = await extractAttachment({ filename: "img.jpg", mime_type: "image/jpeg" }, data);
    expect(result).toEqual({
      kind: "image",
      filename: "img.jpg",
      base64: data.toString("base64"),
      mimeType: "image/jpeg",
    });
  });

  it("retorna texto vazio para mime_type desconhecido", async () => {
    const result = await extractAttachment(
      { filename: "file.bin", mime_type: "application/octet-stream" },
      Buffer.from("data")
    );
    expect(result).toEqual({ kind: "text", filename: "file.bin", content: "" });
  });
});
