const mockFrom = jest.fn();
const mockStorage = { from: jest.fn() };
const mockAdminClient = { from: mockFrom, storage: mockStorage };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

jest.mock("@/lib/ai/pipeline-logger", () => ({
  logPipelineEvent: jest.fn().mockResolvedValue(undefined),
}));

const mockExtractStructured = jest.fn();
jest.mock("@/lib/ai/structured", () => ({
  extractStructured: (...args: unknown[]) => mockExtractStructured(...args),
}));

const mockExtractAttachmentContent = jest.fn();
jest.mock("@/lib/ai/attachment-extractor", () => ({
  extractAttachmentContent: (...args: unknown[]) => mockExtractAttachmentContent(...args),
}));

const mockTracedLLMCall = jest.fn();
jest.mock("@/lib/ai/observe", () => ({
  tracedLLMCall: (...args: unknown[]) => mockTracedLLMCall(...args),
}));

jest.mock("@/inngest/client", () => ({
  inngest: {
    createFunction: jest.fn((_config: unknown, handler: unknown) => handler),
  },
}));

import {
  fetchContactWithAttachments,
  extractAllAttachments,
  upsertAnalyzingStatus,
  saveAnalysisResult,
  saveAnalysisError,
  analyzeContact,
} from "@/inngest/functions/analyze-contact";

const contactRow = {
  id: "c-1",
  name: "Ana",
  email: "ana@test.com",
  project_type: "web",
  description: "Preciso de um sistema de gestão",
  phone: null,
  whatsapp_preferred: false,
  status: "novo",
  created_at: "2026-01-01T00:00:00Z",
};

const attachmentRow = {
  id: "att-1",
  contact_request_id: "c-1",
  filename: "proposta.pdf",
  storage_path: "c-1/proposta.pdf",
  mime_type: "application/pdf",
  size_bytes: 1024,
  created_at: "2026-01-01T00:00:00Z",
};

const analysis = {
  problema: "Empresa sem sistema de gestão",
  solucao_tipo: "novo_produto" as const,
  solucao_titulo: "SaaS de Gestão",
  solucao_descricao: "Plataforma para gestão de pequenas empresas",
  nichos: [
    { publico: "MEIs", justificativa: "Alta demanda" },
    { publico: "Freelancers", justificativa: "Necessidade de organização" },
  ],
  draft_issues: [{ title: "feat: módulo de finanças", body: "Descrição", labels: ["type: feature"] }],
};

// ─── fetchContactWithAttachments ───────────────────────────────────────────

describe("fetchContactWithAttachments", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna contato e anexos quando encontrados", async () => {
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: contactRow, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [attachmentRow] }),
        }),
      });

    const result = await fetchContactWithAttachments("c-1");
    expect(result.contact).toEqual(contactRow);
    expect(result.attachments).toEqual([attachmentRow]);
  });

  it("lança erro quando contato não encontrado", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
        }),
      }),
    });

    await expect(fetchContactWithAttachments("inexistente")).rejects.toThrow("Contato não encontrado");
  });

  it("retorna array vazio de anexos quando não há anexos", async () => {
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: contactRow, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null }),
        }),
      });

    const result = await fetchContactWithAttachments("c-1");
    expect(result.attachments).toEqual([]);
  });
});

// ─── extractAllAttachments ─────────────────────────────────────────────────

describe("extractAllAttachments", () => {
  beforeEach(() => jest.clearAllMocks());

  it("gera signed URL e extrai conteúdo de cada anexo", async () => {
    mockStorage.from.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "https://signed.url" }, error: null }),
    });
    mockExtractAttachmentContent.mockResolvedValue({ filename: "proposta.pdf", content: "texto do pdf" });

    const result = await extractAllAttachments([attachmentRow]);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("texto do pdf");
  });

  it("retorna mensagem de erro quando signed URL falha", async () => {
    mockStorage.from.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({ data: null, error: { message: "forbidden" } }),
    });

    const result = await extractAllAttachments([attachmentRow]);
    expect(result[0].content).toContain("Erro ao obter URL");
  });

  it("retorna mensagem de erro quando extractAttachmentContent lança", async () => {
    mockStorage.from.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "https://signed.url" }, error: null }),
    });
    mockExtractAttachmentContent.mockRejectedValue(new Error("falha"));

    const result = await extractAllAttachments([attachmentRow]);
    expect(result[0].content).toContain("Erro ao processar");
  });

  it("retorna array vazio quando não há anexos", async () => {
    const result = await extractAllAttachments([]);
    expect(result).toEqual([]);
  });
});

// ─── upsertAnalyzingStatus ─────────────────────────────────────────────────

describe("upsertAnalyzingStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("faz upsert com status analyzing", async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert: mockUpsert });

    await upsertAnalyzingStatus("c-1");
    expect(mockFrom).toHaveBeenCalledWith("contact_analysis");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact_request_id: "c-1", status: "analyzing" }),
      expect.any(Object),
    );
  });
});

// ─── saveAnalysisResult ────────────────────────────────────────────────────

describe("saveAnalysisResult", () => {
  beforeEach(() => jest.clearAllMocks());

  it("atualiza contact_analysis com os campos corretos", async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await saveAnalysisResult("c-1", analysis, ["proposta.pdf"]);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "done",
        problema: analysis.problema,
        nichos: analysis.nichos,
        draft_issues: analysis.draft_issues,
        attachments_used: ["proposta.pdf"],
      }),
    );
  });

  it("lança erro quando update falha", async () => {
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: "db error" } }),
      }),
    });

    await expect(saveAnalysisResult("c-1", analysis, [])).rejects.toThrow("Erro ao salvar análise");
  });
});

// ─── saveAnalysisError ─────────────────────────────────────────────────────

describe("saveAnalysisError", () => {
  beforeEach(() => jest.clearAllMocks());

  it("atualiza status para error com mensagem", async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await saveAnalysisError("c-1", "algo falhou");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error", error_message: "algo falhou" }),
    );
  });
});

// ─── analyzeContact — handler ──────────────────────────────────────────────

describe("analyzeContact — handler", () => {
  let step: { run: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    step = {
      run: jest.fn().mockImplementation((_name: string, fn: () => unknown) => fn()),
    };
    mockTracedLLMCall.mockImplementation(
      async (_opts: unknown, fn: () => Promise<{ result: unknown }>) => {
        const { result } = await fn();
        return result;
      },
    );
    mockExtractStructured.mockResolvedValue(analysis);

    // updateCurrentStep("fetch-contact")
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    // fetch-contact
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: contactRow, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

    // updateCurrentStep("extract-attachments")
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    // upsert-analyzing
    mockFrom.mockReturnValueOnce({ upsert: jest.fn().mockResolvedValue({ error: null }) });

    // updateCurrentStep("save-analysis")
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    // saveAnalysisResult
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    // extract-attachments — sem signed URLs (array vazio)
    mockStorage.from.mockReturnValue({ createSignedUrl: jest.fn() });
  });

  async function runHandler() {
    await (analyzeContact as unknown as (args: unknown) => Promise<void>)({
      event: { data: { contactId: "c-1" } },
      step,
    });
  }

  it("executa os cinco steps na ordem correta", async () => {
    await runHandler();
    const names = step.run.mock.calls.map((c: unknown[]) => c[0]);
    expect(names).toEqual([
      "fetch-contact",
      "extract-attachments",
      "upsert-analyzing",
      "run-product-agent",
      "save-analysis",
    ]);
  });

  it("chama tracedLLMCall com agentName correto", async () => {
    await runHandler();
    expect(mockTracedLLMCall).toHaveBeenCalledWith(
      expect.objectContaining({ agentName: "contact-product-analyzer" }),
      expect.any(Function),
    );
  });

  it("chama extractStructured com o schema de análise", async () => {
    await runHandler();
    expect(mockExtractStructured).toHaveBeenCalledWith(
      expect.any(String),
      expect.anything(),
    );
  });

  it("inclui contexto de anexos no prompt quando há arquivos extraídos", async () => {
    jest.clearAllMocks();
    mockFrom.mockReset(); // limpa a fila de mockReturnValueOnce do beforeEach

    const extractedAttachments = [{ filename: "proposta.pdf", content: "conteúdo extraído" }];

    // "extract-attachments" retorna diretamente para exercitar as lambdas 184 e 209
    step = {
      run: jest.fn().mockImplementation((name: string, fn: () => unknown) => {
        if (name === "extract-attachments") return Promise.resolve(extractedAttachments);
        return fn();
      }),
    };
    mockTracedLLMCall.mockImplementation(
      async (_opts: unknown, fn: () => Promise<{ result: unknown }>) => {
        const { result } = await fn();
        return result;
      },
    );
    mockExtractStructured.mockResolvedValue(analysis);

    // updateCurrentStep("fetch-contact")
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    // fetch-contact
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: contactRow, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

    // "extract-attachments" é bypassado pelo step mock — updateCurrentStep não é chamado

    mockFrom.mockReturnValueOnce({ upsert: jest.fn().mockResolvedValue({ error: null }) });
    // updateCurrentStep("save-analysis")
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });
    // saveAnalysisResult
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    await (analyzeContact as unknown as (args: unknown) => Promise<void>)({
      event: { data: { contactId: "c-1" } },
      step,
    });

    // lambdas das linhas 184 e 209 exercitadas: prompt deve conter o arquivo extraído
    expect(mockExtractStructured).toHaveBeenCalledWith(
      expect.stringContaining("proposta.pdf"),
      expect.anything(),
    );
  });
});
