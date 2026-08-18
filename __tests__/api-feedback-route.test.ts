jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsertFeedback = jest.fn(() => ({ select: mockSelect }));
const mockInsertAttachment = jest.fn();
const mockUpload = jest.fn();
const mockStorageFrom = jest.fn(() => ({ upload: mockUpload }));
const mockFrom = jest.fn((table: string) => {
  if (table === "feedback") return { insert: mockInsertFeedback };
  return { insert: mockInsertAttachment };
});
const mockAdminClient = {
  storage: { from: mockStorageFrom },
  from: mockFrom,
};

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { POST } from "@/app/api/feedback/route";

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  const content = new Uint8Array(sizeBytes);
  const file = new File([content], name, { type });
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

function makeErrorReq() {
  return {
    formData: async () => { throw new Error("parse error"); },
  } as unknown as Parameters<typeof POST>[0];
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: { id: "fb-uuid-001" }, error: null });
    mockUpload.mockResolvedValue({ error: null });
    mockInsertAttachment.mockResolvedValue({ error: null });
  });

  describe("caminhos de erro — GAP-001", () => {
    it("400 quando formData não pode ser lido", async () => {
      const res = await POST(makeErrorReq());
      expect(res.status).toBe(400);
    });

    it("400 quando product_id está ausente", async () => {
      const res = await POST(makeReq({ mensagem: "mensagem suficientemente longa" }));
      expect(res.status).toBe(400);
    });

    it("400 quando mensagem tem menos de 10 caracteres", async () => {
      const res = await POST(makeReq({ product_id: "devprint", mensagem: "curto" }));
      expect(res.status).toBe(400);
      const body = await res.json() as { status: string; message: string };
      expect(body.message).toMatch(/pelo menos 10 caracteres/i);
    });

    it("400 quando e-mail tem formato inválido", async () => {
      const res = await POST(makeReq({
        product_id: "devprint",
        email: "nao-e-email",
        mensagem: "mensagem de feedback válida aqui",
      }));
      expect(res.status).toBe(400);
    });

    it("400 para tipo de arquivo não permitido", async () => {
      const res = await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        attachments: makeFile("virus.exe", "application/x-msdownload"),
      }));
      expect(res.status).toBe(400);
    });

    it("400 quando arquivo excede 10 MB", async () => {
      const res = await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        attachments: makeFile("grande.pdf", "application/pdf", 11 * 1024 * 1024),
      }));
      expect(res.status).toBe(400);
    });

    it("400 quando mais de 5 arquivos são enviados", async () => {
      const files = Array.from({ length: 6 }, (_, i) =>
        makeFile(`f${i}.pdf`, "application/pdf", 100)
      );
      const res = await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        attachments: files,
      }));
      expect(res.status).toBe(400);
    });

    it("500 quando insert no feedback falha", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: "db error" } });
      const res = await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
      }));
      expect(res.status).toBe(500);
    });

    it("500 quando upload do arquivo falha", async () => {
      mockUpload.mockResolvedValue({ error: { message: "storage error" } });
      const res = await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        attachments: makeFile("doc.pdf", "application/pdf", 1024),
      }));
      expect(res.status).toBe(500);
    });
  });

  describe("sucesso", () => {
    it("retorna status success para feedback sem anexos", async () => {
      const res = await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
      }));
      expect(res.status).toBe(200);
      const body = await res.json() as { status: string };
      expect(body.status).toBe("success");
      expect(mockFrom).toHaveBeenCalledWith("feedback");
    });

    it("aceita e-mail em branco (campo opcional)", async () => {
      const res = await POST(makeReq({
        product_id: "devprint",
        email: "",
        mensagem: "mensagem de feedback válida aqui",
      }));
      expect(res.status).toBe(200);
    });

    it("processa arquivo PDF válido com sucesso", async () => {
      const res = await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        attachments: makeFile("relatorio.pdf", "application/pdf", 2048),
      }));
      expect(res.status).toBe(200);
      expect(mockStorageFrom).toHaveBeenCalledWith("feedback-attachments");
      expect(mockFrom).toHaveBeenCalledWith("feedback_attachments");
    });

    it("inclui notify_on_completion no insert quando campo está preenchido", async () => {
      await POST(makeReq({
        product_id: "devprint",
        mensagem: "mensagem de feedback válida aqui",
        notify_on_completion: "true",
        notify_email: "user@example.com",
      }));
      expect(mockInsertFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ notify_on_completion: true })
      );
    });
  });
});
