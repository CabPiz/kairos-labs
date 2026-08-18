import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const mockGetUser = jest.fn();
const mockAdminFrom = jest.fn();

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
  createServerAdminClient: jest.fn(() => ({ from: mockAdminFrom })),
}));

import { GET } from "@/app/api/admin/feedback-attachments/route";

function makeReq(feedbackId?: string) {
  return {
    nextUrl: { searchParams: new URLSearchParams(feedbackId ? `feedback_id=${feedbackId}` : "") },
  } as unknown as NextRequest;
}

const mockUser = { id: "user-1" };

describe("GET /api/admin/feedback-attachments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 quando não autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await GET(makeReq("fb-1"));
    expect(res.status).toBe(401);
  });

  it("retorna 400 quando feedback_id não informado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    const res = await GET(makeReq());
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/feedback_id/i);
  });

  it("retorna 500 quando query falha", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockAdminFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({ data: null, error: new Error("db error") }),
    });
    const res = await GET(makeReq("fb-1"));
    expect(res.status).toBe(500);
  });

  it("retorna lista de attachments com sucesso", async () => {
    const attachments = [{ id: "att-1", filename: "doc.pdf", storage_path: "fb-1/doc.pdf", mime_type: "application/pdf", size_bytes: 1024 }];
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockAdminFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({ data: attachments, error: null }),
    });
    const res = await GET(makeReq("fb-1"));
    expect(res.status).toBe(200);
    const body = await res.json() as { attachments: unknown[] };
    expect(body.attachments).toHaveLength(1);
  });
});
