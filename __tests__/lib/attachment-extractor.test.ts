const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock("pdf-parse", () =>
  jest.fn().mockResolvedValue({ text: "texto extraído do pdf" }),
);

jest.mock("mammoth", () => ({
  extractRawText: jest.fn().mockResolvedValue({ value: "texto extraído do docx" }),
}));

import { extractAttachmentContent } from "@/lib/ai/attachment-extractor";

function makeResponse(body: string | Buffer, ok = true): Response {
  const buf = typeof body === "string" ? Buffer.from(body) : body;
  return {
    ok,
    status: ok ? 200 : 500,
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    text: async () => (typeof body === "string" ? body : body.toString("utf-8")),
  } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("extractAttachmentContent — PDF", () => {
  it("extrai texto de PDF via pdf-parse", async () => {
    mockFetch.mockResolvedValue(makeResponse(Buffer.from("pdf bytes")));
    const result = await extractAttachmentContent("https://signed.url/file.pdf", "relatorio.pdf", "application/pdf");
    expect(result.filename).toBe("relatorio.pdf");
    expect(result.content).toBe("texto extraído do pdf");
    expect(result.base64Data).toBeUndefined();
  });
});

describe("extractAttachmentContent — DOCX", () => {
  it("extrai texto de DOCX via mammoth", async () => {
    mockFetch.mockResolvedValue(makeResponse(Buffer.from("docx bytes")));
    const result = await extractAttachmentContent(
      "https://signed.url/file.docx",
      "proposta.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(result.filename).toBe("proposta.docx");
    expect(result.content).toBe("texto extraído do docx");
  });
});

describe("extractAttachmentContent — TXT", () => {
  it("retorna o texto diretamente para arquivos TXT", async () => {
    mockFetch.mockResolvedValue(makeResponse("conteúdo do texto"));
    const result = await extractAttachmentContent("https://signed.url/file.txt", "notas.txt", "text/plain");
    expect(result.content).toBe("conteúdo do texto");
  });
});

describe("extractAttachmentContent — Imagem", () => {
  it("converte PNG para base64 e retorna mediaType", async () => {
    const imgBuffer = Buffer.from("fake-png-bytes");
    mockFetch.mockResolvedValue(makeResponse(imgBuffer));
    const result = await extractAttachmentContent("https://signed.url/img.png", "foto.png", "image/png");
    expect(result.mediaType).toBe("image/png");
    expect(result.base64Data).toBe(imgBuffer.toString("base64"));
    expect(result.content).toContain("foto.png");
  });

  it("converte JPG para base64 e retorna mediaType", async () => {
    const imgBuffer = Buffer.from("fake-jpg-bytes");
    mockFetch.mockResolvedValue(makeResponse(imgBuffer));
    const result = await extractAttachmentContent("https://signed.url/img.jpg", "screenshot.jpg", "image/jpeg");
    expect(result.mediaType).toBe("image/jpeg");
    expect(result.base64Data).toBe(imgBuffer.toString("base64"));
  });
});

describe("extractAttachmentContent — tipo não suportado", () => {
  it("retorna mensagem de tipo não suportado para MIME desconhecido", async () => {
    mockFetch.mockResolvedValue(makeResponse(Buffer.from("binary")));
    const result = await extractAttachmentContent(
      "https://signed.url/file.bin",
      "dados.bin",
      "application/octet-stream",
    );
    expect(result.content).toContain("Tipo não suportado");
  });
});

describe("extractAttachmentContent — erro HTTP", () => {
  it("lança erro quando fetch retorna status não-ok", async () => {
    mockFetch.mockResolvedValue(makeResponse("not found", false));
    await expect(
      extractAttachmentContent("https://signed.url/missing.pdf", "faltando.pdf", "application/pdf"),
    ).rejects.toThrow("Falha ao baixar anexo faltando.pdf");
  });
});
