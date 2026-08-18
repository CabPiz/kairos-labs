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

import { POST } from "@/app/api/admin/create-github-issue/route";

const originalEnv = process.env;
const mockUser = { id: "user-1" };

function makeReq(body: Record<string, unknown>) {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

function mockFeedbackQuery(data: unknown, error: unknown = null) {
  const single = jest.fn().mockResolvedValueOnce({ data, error });
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  mockAdminFrom.mockReturnValueOnce({ select });
}

describe("POST /api/admin/create-github-issue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GITHUB_PAT: "ghp_test" };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna 401 quando não autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await POST(makeReq({ feedbackId: "fb-1" }));
    expect(res.status).toBe(401);
  });

  it("retorna 500 quando GITHUB_PAT não configurado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    delete process.env.GITHUB_PAT;
    const res = await POST(makeReq({ feedbackId: "fb-1" }));
    expect(res.status).toBe(500);
  });

  it("retorna 400 quando feedbackId não informado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("retorna 404 quando feedback não encontrado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockFeedbackQuery(null, new Error("not found"));
    const res = await POST(makeReq({ feedbackId: "fb-1" }));
    expect(res.status).toBe(404);
  });

  it("retorna 500 quando criação de issue falha na API do GitHub", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockFeedbackQuery({ issue_draft: null, notify_on_completion: false });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const res = await POST(makeReq({ feedbackId: "fb-1", title: "Bug", issueBody: "desc", labels: [] }));
    expect(res.status).toBe(500);
  });

  it("cria issue com sucesso e retorna número e URL", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockFeedbackQuery({ issue_draft: null, notify_on_completion: false });

    const issueData = { number: 99, html_url: "https://github.com/issue/99", node_id: "I_99" };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => issueData })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { user: { projectV2: { id: "PVT_1" } } } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const updateEq = jest.fn().mockResolvedValueOnce({ error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    mockAdminFrom.mockReturnValueOnce({ update });

    const res = await POST(makeReq({ feedbackId: "fb-1", title: "Bug", issueBody: "desc", labels: ["type: bug"] }));
    expect(res.status).toBe(200);
    const body = await res.json() as { issueNumber: number; issueUrl: string };
    expect(body.issueNumber).toBe(99);
    expect(body.issueUrl).toBe("https://github.com/issue/99");
  });

  it("registra feedback_notifications quando notify_on_completion é true", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser } });
    mockFeedbackQuery({ issue_draft: null, notify_on_completion: true });

    const issueData = { number: 42, html_url: "https://github.com/issue/42", node_id: "I_42" };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => issueData })
      .mockResolvedValueOnce({ ok: false });

    const updateEq = jest.fn().mockResolvedValueOnce({ error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    const insert = jest.fn().mockResolvedValueOnce({ error: null });
    mockAdminFrom
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce({ insert });

    const res = await POST(makeReq({ feedbackId: "fb-1", title: "Feature", issueBody: "desc", labels: [] }));
    expect(res.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ github_issue_number: 42 }));
  });
});
