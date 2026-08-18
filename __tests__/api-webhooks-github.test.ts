import type { NextRequest } from "next/server";
import { createHmac } from "node:crypto";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const mockAdminFrom = jest.fn();

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => ({ from: mockAdminFrom })),
}));

const mockResendSend = jest.fn();
jest.mock("resend", () => ({
  Resend: jest.fn(() => ({ emails: { send: mockResendSend } })),
}));

import { POST } from "@/app/api/webhooks/github/route";

const SECRET = "test-webhook-secret";
const originalEnv = process.env;

function sign(body: string): string {
  return `sha256=${createHmac("sha256", SECRET).update(body, "utf-8").digest("hex")}`;
}

function makeReq(body: unknown, event = "issues"): NextRequest {
  const rawBody = JSON.stringify(body);
  return {
    text: async () => rawBody,
    headers: {
      get: (name: string) => {
        const map: Record<string, string> = {
          "x-github-event": event,
          "x-hub-signature-256": sign(rawBody),
        };
        return map[name] ?? null;
      },
    },
  } as unknown as NextRequest;
}

function makeReqBadSig(body: unknown): NextRequest {
  return {
    text: async () => JSON.stringify(body),
    headers: {
      get: (name: string) => {
        const map: Record<string, string> = {
          "x-github-event": "issues",
          "x-hub-signature-256": "sha256=invalidsig",
        };
        return map[name] ?? null;
      },
    },
  } as unknown as NextRequest;
}

const closedPayload = {
  action: "closed",
  issue: { number: 42, title: "Bug fix", html_url: "https://github.com/issues/42" },
};

function mockNotifQuery(data: unknown) {
  const eq2 = jest.fn().mockResolvedValueOnce({ data, error: null });
  const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
  const select = jest.fn().mockReturnValue({ eq: eq1 });
  mockAdminFrom.mockReturnValueOnce({ select });
}

function mockSettingsQuery(value: unknown) {
  const single = jest.fn().mockResolvedValueOnce({ data: value, error: null });
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  mockAdminFrom.mockReturnValueOnce({ select });
}

function mockFeedbackQuery(data: unknown) {
  const single = jest.fn().mockResolvedValueOnce({ data, error: null });
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  mockAdminFrom.mockReturnValueOnce({ select });
}

function mockNotifUpdate() {
  const eq = jest.fn().mockResolvedValueOnce({ error: null });
  const update = jest.fn().mockReturnValue({ eq });
  mockAdminFrom.mockReturnValueOnce({ update });
}

describe("POST /api/webhooks/github", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GITHUB_WEBHOOK_SECRET: SECRET, RESEND_API_KEY: "re_test" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna 500 quando GITHUB_WEBHOOK_SECRET não configurado", async () => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
    const res = await POST(makeReq(closedPayload));
    expect(res.status).toBe(500);
  });

  it("retorna 401 quando assinatura inválida", async () => {
    const res = await POST(makeReqBadSig(closedPayload));
    expect(res.status).toBe(401);
  });

  it("ignora eventos que não são 'issues'", async () => {
    const res = await POST(makeReq({ action: "pushed" }, "push"));
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("ignored");
  });

  it("ignora action que não é 'closed'", async () => {
    const res = await POST(makeReq({ action: "opened", issue: { number: 1, title: "A", html_url: "url" } }));
    const body = await res.json() as { status: string };
    expect(body.status).toBe("ignored");
  });

  it("retorna no_notifications quando nenhuma notificação pendente", async () => {
    mockNotifQuery([]);
    const res = await POST(makeReq(closedPayload));
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("no_notifications");
  });

  it("processa notificação e envia e-mail (produto não lançado)", async () => {
    mockNotifQuery([{ id: "n-1", feedback_id: "fb-1" }]);
    mockSettingsQuery(null);
    mockFeedbackQuery({ notify_email: "user@example.com" });
    mockResendSend.mockResolvedValueOnce({ error: null });
    mockNotifUpdate();

    const res = await POST(makeReq(closedPayload));
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("processed");
    expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
  });

  it("processa notificação com produto lançado", async () => {
    mockNotifQuery([{ id: "n-2", feedback_id: "fb-2" }]);
    mockSettingsQuery({ value: { launched: true } });
    mockFeedbackQuery({ notify_email: "other@example.com" });
    mockResendSend.mockResolvedValueOnce({ error: null });
    mockNotifUpdate();

    const res = await POST(makeReq(closedPayload));
    expect(res.status).toBe(200);
  });

  it("pula notificação quando notify_email é null", async () => {
    mockNotifQuery([{ id: "n-3", feedback_id: "fb-3" }]);
    mockSettingsQuery(null);
    mockFeedbackQuery({ notify_email: null });

    const res = await POST(makeReq(closedPayload));
    expect(res.status).toBe(200);
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it("marca notificação como 'failed' quando Resend retorna erro", async () => {
    mockNotifQuery([{ id: "n-4", feedback_id: "fb-4" }]);
    mockSettingsQuery(null);
    mockFeedbackQuery({ notify_email: "fail@example.com" });
    mockResendSend.mockResolvedValueOnce({ error: { message: "API error" } });
    mockNotifUpdate();

    const res = await POST(makeReq(closedPayload));
    expect(res.status).toBe(200);
  });
});
