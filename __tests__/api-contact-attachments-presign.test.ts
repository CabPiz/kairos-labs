jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const mockCreateSignedUploadUrl = jest.fn();
const mockStorageFrom = jest.fn(() => ({ createSignedUploadUrl: mockCreateSignedUploadUrl }));
const mockAdminClient = { storage: { from: mockStorageFrom } };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { POST } from "@/app/api/contact-attachments/presign/route";

Object.defineProperty(global, "crypto", {
  value: { randomUUID: () => "test-uuid-fixed" },
  configurable: true,
});

function makeReq(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof POST>[0];
}

function makeInvalidReq() {
  return {
    json: async () => { throw new Error("parse error"); },
  } as unknown as Parameters<typeof POST>[0];
}

describe("POST /api/contact-attachments/presign", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSignedUploadUrl.mockResolvedValue({
      data: { signedUrl: "https://storage.example.com/upload/sign/path", token: "tok-abc", path: "path" },
      error: null,
    });
  });

  it("retorna 400 quando JSON não pode ser lido", async () => {
    const res = await POST(makeInvalidReq());
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando contact_request_id está ausente", async () => {
    const res = await POST(makeReq({ filename: "a.pdf", mime_type: "application/pdf", size: 100 }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando filename está ausente", async () => {
    const res = await POST(makeReq({ contact_request_id: "uuid-123", mime_type: "application/pdf", size: 100 }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 para tipo MIME não permitido", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "virus.exe",
      mime_type: "application/x-msdownload",
      size: 100,
    }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando size excede 10 MB", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "grande.pdf",
      mime_type: "application/pdf",
      size: 10 * 1024 * 1024 + 1,
    }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando size é negativo", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "doc.pdf",
      mime_type: "application/pdf",
      size: -1,
    }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando size não é número", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "doc.pdf",
      mime_type: "application/pdf",
      size: "grande",
    }));
    expect(res.status).toBe(400);
  });

  it("retorna 500 quando Supabase Storage retorna erro", async () => {
    mockCreateSignedUploadUrl.mockResolvedValue({ data: null, error: { message: "storage error" } });
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "doc.pdf",
      mime_type: "application/pdf",
      size: 1024,
    }));
    expect(res.status).toBe(500);
  });

  it("retorna 200 com signed_url, token e path no sucesso", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "doc.pdf",
      mime_type: "application/pdf",
      size: 1024,
    }));
    expect(res.status).toBe(200);
    const body = await res.json() as { signed_url: string; token: string; path: string };
    expect(body.signed_url).toBe("https://storage.example.com/upload/sign/path");
    expect(body.token).toBe("tok-abc");
    expect(body.path).toBe("uuid-123/test-uuid-fixed.pdf");
    expect(mockStorageFrom).toHaveBeenCalledWith("contact-attachments");
  });

  it("gera path sem extensão quando filename não tem ponto", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "arquivo-sem-extensao",
      mime_type: "text/plain",
      size: 100,
    }));
    expect(res.status).toBe(200);
    const body = await res.json() as { path: string };
    expect(body.path).toBe("uuid-123/test-uuid-fixed");
  });

  it("aceita exatamente 10 MB", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      filename: "doc.pdf",
      mime_type: "application/pdf",
      size: 10 * 1024 * 1024,
    }));
    expect(res.status).toBe(200);
  });

  it.each([
    ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "doc.docx"],
    ["text/plain", "notes.txt"],
    ["image/png", "foto.png"],
    ["image/jpeg", "foto.jpg"],
  ])("aceita tipo MIME %s", async (mime_type, filename) => {
    const res = await POST(makeReq({ contact_request_id: "uuid-123", filename, mime_type, size: 100 }));
    expect(res.status).toBe(200);
  });
});
