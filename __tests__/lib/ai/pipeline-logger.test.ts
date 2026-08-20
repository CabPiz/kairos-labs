const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { logPipelineEvent } from "@/lib/ai/pipeline-logger";

describe("logPipelineEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("insere no banco com os campos corretos", async () => {
    await logPipelineEvent("req-1", "fetch-contact", "start");

    expect(mockFrom).toHaveBeenCalledWith("pipeline_logs");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contact_request_id: "req-1",
        step_name: "fetch-contact",
        status: "start",
        message: null,
        metadata: {},
        duration_ms: null,
      }),
    );
  });

  it("passa message, metadata e durationMs quando fornecidos", async () => {
    await logPipelineEvent("req-2", "save-analysis", "success", {
      message: "ok",
      metadata: { key: "value" },
      durationMs: 123,
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "ok",
        metadata: { key: "value" },
        duration_ms: 123,
      }),
    );
  });

  it("não lança quando o insert retorna erro", async () => {
    mockInsert.mockResolvedValue({ error: { message: "db error" } });
    await expect(
      logPipelineEvent("req-3", "pipeline-error", "error"),
    ).resolves.toBeUndefined();
  });

  it("não lança quando o insert lança exceção inesperada", async () => {
    mockInsert.mockRejectedValue(new Error("crash"));
    await expect(
      logPipelineEvent("req-4", "run-product-agent", "error"),
    ).resolves.toBeUndefined();
  });
});
