jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { POST } from "@/app/api/contact-attachments/confirm/route";

function makeReq(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof POST>[0];
}

function makeInvalidReq() {
  return {
    json: async () => { throw new Error("parse error"); },
  } as unknown as Parameters<typeof POST>[0];
}

const sampleFiles = [
  { path: "uuid-123/abc.pdf", filename: "doc.pdf", size: 1024, mime_type: "application/pdf" },
];

describe("POST /api/contact-attachments/confirm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("retorna 400 quando JSON não pode ser lido", async () => {
    const res = await POST(makeInvalidReq());
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando contact_request_id está ausente", async () => {
    const res = await POST(makeReq({ files: sampleFiles }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando files está ausente", async () => {
    const res = await POST(makeReq({ contact_request_id: "uuid-123" }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando files está vazio", async () => {
    const res = await POST(makeReq({ contact_request_id: "uuid-123", files: [] }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando files não é array", async () => {
    const res = await POST(makeReq({ contact_request_id: "uuid-123", files: "nao-e-array" }));
    expect(res.status).toBe(400);
  });

  it("retorna 500 quando o insert no banco falha", async () => {
    mockInsert.mockResolvedValue({ error: { message: "db error" } });
    const res = await POST(makeReq({ contact_request_id: "uuid-123", files: sampleFiles }));
    expect(res.status).toBe(500);
  });

  it("retorna 200 com ok=true no sucesso", async () => {
    const res = await POST(makeReq({ contact_request_id: "uuid-123", files: sampleFiles }));
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("contact_attachments");
    expect(mockInsert).toHaveBeenCalledWith({
      contact_request_id: "uuid-123",
      filename: "doc.pdf",
      storage_path: "uuid-123/abc.pdf",
      mime_type: "application/pdf",
      size_bytes: 1024,
    });
  });

  it("retorna 200 e faz insert para cada arquivo na lista", async () => {
    const multiFiles = [
      { path: "uuid-123/a.pdf", filename: "a.pdf", size: 1024, mime_type: "application/pdf" },
      { path: "uuid-123/b.png", filename: "b.png", size: 2048, mime_type: "image/png" },
    ];
    const res = await POST(makeReq({ contact_request_id: "uuid-123", files: multiFiles }));
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it("retorna 500 e para no primeiro erro quando segundo arquivo falha", async () => {
    mockInsert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "db error no segundo" } });
    const multiFiles = [
      { path: "uuid-123/a.pdf", filename: "a.pdf", size: 1024, mime_type: "application/pdf" },
      { path: "uuid-123/b.png", filename: "b.png", size: 2048, mime_type: "image/png" },
    ];
    const res = await POST(makeReq({ contact_request_id: "uuid-123", files: multiFiles }));
    expect(res.status).toBe(500);
  });
});
