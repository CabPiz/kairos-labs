const mockCreateSignedUrl = jest.fn();
const mockStorageFrom = jest.fn(() => ({ createSignedUrl: mockCreateSignedUrl }));

const mockFrom = jest.fn();
const mockAdminClient = {
  from: mockFrom,
  storage: { from: mockStorageFrom },
};

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

const mockInngestSend = jest.fn();
jest.mock("@/inngest/client", () => ({
  inngest: { send: (...args: unknown[]) => mockInngestSend(...args) },
}));

jest.mock("@/lib/ai/pipeline-logger", () => ({
  logPipelineEvent: jest.fn().mockResolvedValue(undefined),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

import {
  markContactViewed,
  getAttachmentSignedUrl,
  triggerContactAnalysis,
  getContactAnalysis,
  createGitHubIssue,
} from "@/app/admin/contacts/actions";

// ─── markContactViewed ─────────────────────────────────────────────────────

describe("markContactViewed", () => {
  beforeEach(() => jest.clearAllMocks());

  it("chama update com status visualizado filtrando por id e status novo", async () => {
    const mockEq2 = jest.fn();
    const mockEq1 = jest.fn(() => ({ eq: mockEq2 }));
    const mockUpdateFn = jest.fn(() => ({ eq: mockEq1 }));
    mockFrom.mockReturnValue({ update: mockUpdateFn });

    await markContactViewed("uuid-abc");

    expect(mockFrom).toHaveBeenCalledWith("contact_requests");
    expect(mockUpdateFn).toHaveBeenCalledWith({ status: "visualizado" });
    expect(mockEq1).toHaveBeenCalledWith("id", "uuid-abc");
    expect(mockEq2).toHaveBeenCalledWith("status", "novo");
  });
});

// ─── getAttachmentSignedUrl ────────────────────────────────────────────────

describe("getAttachmentSignedUrl", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna signed URL quando Supabase responde com sucesso", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://example.com/signed" },
      error: null,
    });

    const url = await getAttachmentSignedUrl("uuid/arquivo.pdf");
    expect(url).toBe("https://example.com/signed");
    expect(mockStorageFrom).toHaveBeenCalledWith("contact-attachments");
    expect(mockCreateSignedUrl).toHaveBeenCalledWith("uuid/arquivo.pdf", 60);
  });

  it("retorna null quando Supabase retorna erro", async () => {
    mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: "not found" } });
    const url = await getAttachmentSignedUrl("uuid/inexistente.pdf");
    expect(url).toBeNull();
  });

  it("retorna null quando signedUrl está ausente na resposta", async () => {
    mockCreateSignedUrl.mockResolvedValue({ data: {}, error: null });
    const url = await getAttachmentSignedUrl("uuid/arquivo.pdf");
    expect(url).toBeNull();
  });
});

// ─── triggerContactAnalysis ────────────────────────────────────────────────

describe("triggerContactAnalysis", () => {
  beforeEach(() => jest.clearAllMocks());

  it("faz upsert com status pending e envia evento Inngest", async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert: mockUpsert });
    mockInngestSend.mockResolvedValue(undefined);

    await triggerContactAnalysis("c-1");

    expect(mockFrom).toHaveBeenCalledWith("contact_analysis");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact_request_id: "c-1", status: "pending" }),
      expect.any(Object),
    );
    expect(mockInngestSend).toHaveBeenCalledWith(
      expect.objectContaining({ name: "contact/analyze.requested", data: { contactId: "c-1" } }),
    );
  });

  it("atualiza status para error e relança quando inngest.send falha", async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert: mockUpsert, update: mockUpdate });

    const sendError = new Error("Inngest indisponível");
    mockInngestSend.mockRejectedValue(sendError);

    await expect(triggerContactAnalysis("c-2")).rejects.toThrow("Inngest indisponível");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error", error_message: "Inngest indisponível" }),
    );
    expect(mockEq).toHaveBeenCalledWith("contact_request_id", "c-2");
  });

  it("usa mensagem genérica quando o erro não é instância de Error", async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert: mockUpsert, update: mockUpdate });

    mockInngestSend.mockRejectedValue("string-error");

    await expect(triggerContactAnalysis("c-3")).rejects.toBe("string-error");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error", error_message: "Erro ao enfileirar análise" }),
    );
  });
});

// ─── getContactAnalysis ────────────────────────────────────────────────────

describe("getContactAnalysis", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna a análise quando encontrada", async () => {
    const row = { id: "a-1", contact_request_id: "c-1", status: "done" };
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: row }),
        }),
      }),
    });

    const result = await getContactAnalysis("c-1");
    expect(result).toEqual(row);
  });

  it("retorna null quando não há análise", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null }),
        }),
      }),
    });

    const result = await getContactAnalysis("c-1");
    expect(result).toBeNull();
  });
});

// ─── createGitHubIssue ─────────────────────────────────────────────────────

describe("createGitHubIssue", () => {
  const issueData = { title: "feat: nova feature", body: "Descrição", labels: ["type: feature"] };
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GITHUB_TOKEN: "ghp_fake_token" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("cria issue, atualiza contact_analysis e marca contact_request como respondido", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ html_url: "https://github.com/CabPiz/kairos-labs/issues/200", number: 200 }),
    });

    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const result = await createGitHubIssue("c-1", issueData);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/CabPiz/kairos-labs/issues",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.number).toBe(200);
    expect(result.url).toContain("issues/200");
  });

  it("lança erro quando GITHUB_TOKEN não está configurado", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(createGitHubIssue("c-1", issueData)).rejects.toThrow("GITHUB_TOKEN não configurado");
  });

  it("lança erro quando GitHub API retorna status não-ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "Validation Failed",
    });

    await expect(createGitHubIssue("c-1", issueData)).rejects.toThrow("GitHub API error 422");
  });
});
