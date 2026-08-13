jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const mockUpload = jest.fn();
const mockStorageFrom = jest.fn(() => ({ upload: mockUpload }));
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockAdminClient = {
  storage: { from: mockStorageFrom },
  from: mockFrom,
};

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { POST } from "@/app/api/contact-attachments/route";

Object.defineProperty(global, "crypto", {
  value: { randomUUID: () => "test-uuid-fixed" },
  configurable: true,
});

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  const file = new File([content], name, { type });
  // jsdom não implementa File.arrayBuffer() — polyfill para o ambiente de teste
  Object.defineProperty(file, "arrayBuffer", {
    value: () => Promise.resolve(content.buffer),
  });
  return file;
}

function makeReq(fields: Record<string, string | File | File[]>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      for (const f of value) formData.append(key, f);
    } else {
      formData.append(key, value);
    }
  }
  return { formData: async () => formData } as unknown as Parameters<typeof POST>[0];
}

function makeEmptyReq() {
  return { formData: async () => { throw new Error("parse error"); } } as unknown as Parameters<typeof POST>[0];
}

describe("POST /api/contact-attachments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpload.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("retorna 400 quando formData não pode ser lido", async () => {
    const res = await POST(makeEmptyReq());
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando contact_request_id está ausente", async () => {
    const res = await POST(makeReq({ files: makeFile("a.pdf", "application/pdf", 100) }));
    expect(res.status).toBe(400);
  });

  it("retorna 200 com paths vazio quando nenhum arquivo é enviado", async () => {
    const res = await POST(makeReq({ contact_request_id: "uuid-123" }));
    expect(res.status).toBe(200);
    const body = await res.json() as { paths: string[] };
    expect(body.paths).toHaveLength(0);
  });

  it("retorna 400 para tipo de arquivo não permitido", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      files: makeFile("virus.exe", "application/x-msdownload", 100),
    }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando arquivo excede 10 MB", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      files: makeFile("grande.pdf", "application/pdf", 11 * 1024 * 1024),
    }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando mais de 5 arquivos são enviados", async () => {
    const files = Array.from({ length: 6 }, (_, i) =>
      makeFile(`f${i}.pdf`, "application/pdf", 100)
    );
    const res = await POST(makeReq({ contact_request_id: "uuid-123", files }));
    expect(res.status).toBe(400);
  });

  it("retorna 200 com paths quando upload e insert têm sucesso", async () => {
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      files: makeFile("doc.pdf", "application/pdf", 1024),
    }));
    expect(res.status).toBe(200);
    const body = await res.json() as { paths: string[] };
    expect(body.paths).toHaveLength(1);
    expect(mockStorageFrom).toHaveBeenCalledWith("contact-attachments");
    expect(mockFrom).toHaveBeenCalledWith("contact_attachments");
  });

  it("retorna 500 quando o upload falha", async () => {
    mockUpload.mockResolvedValue({ error: { message: "storage error" } });
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      files: makeFile("doc.pdf", "application/pdf", 1024),
    }));
    expect(res.status).toBe(500);
  });

  it("retorna 500 quando o insert no banco falha", async () => {
    mockInsert.mockResolvedValue({ error: { message: "db error" } });
    const res = await POST(makeReq({
      contact_request_id: "uuid-123",
      files: makeFile("doc.pdf", "application/pdf", 1024),
    }));
    expect(res.status).toBe(500);
  });
});
