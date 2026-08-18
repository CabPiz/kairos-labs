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
const mockCreateSignedUrl = jest.fn();

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
  createServerAdminClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({ createSignedUrl: mockCreateSignedUrl })),
    },
  })),
}));

import { GET } from "@/app/api/admin/feedback-attachments/signed-url/route";

function makeReq(path?: string) {
  return {
    nextUrl: { searchParams: new URLSearchParams(path ? `path=${encodeURIComponent(path)}` : "") },
  } as unknown as NextRequest;
}

const mockUser = { id: "user-1" };

describe("GET /api/admin/feedback-attachments/signed-url", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 401 quando não autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await GET(makeReq("some/path.pdf"));
    expect(res.status).toBe(401);
  });

  it("retorna 400 quando path não informado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    const res = await GET(makeReq());
    expect(res.status).toBe(400);
  });

  it("retorna 500 quando createSignedUrl falha", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockCreateSignedUrl.mockResolvedValueOnce({ data: null, error: new Error("storage error") });
    const res = await GET(makeReq("fb/doc.pdf"));
    expect(res.status).toBe(500);
  });

  it("retorna URL assinada com sucesso", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockCreateSignedUrl.mockResolvedValueOnce({ data: { signedUrl: "https://example.com/signed" }, error: null });
    const res = await GET(makeReq("fb/doc.pdf"));
    expect(res.status).toBe(200);
    const body = await res.json() as { url: string };
    expect(body.url).toBe("https://example.com/signed");
  });
});
