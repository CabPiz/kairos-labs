import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import type { FeedbackWithMeta, IssueDraftJson } from "@/lib/types";

jest.mock("@/components/legal/AIDisclosureBadge", () => ({
  AIDisclosureBadge: () => <span data-testid="ai-badge">AI Badge</span>,
}));

jest.mock("lucide-react", () => ({
  X: () => null,
  Paperclip: () => null,
  Download: () => null,
  Loader2: () => null,
  Sparkles: () => null,
  ExternalLink: () => null,
  Bell: () => <span data-testid="bell-icon" />,
}));

import { FeedbackDrawer } from "@/components/admin/FeedbackDrawer";

function makeFeedback(overrides: Partial<FeedbackWithMeta> = {}): FeedbackWithMeta {
  return {
    id: "fb-001",
    product_id: "kairos",
    nome: "João Silva",
    email: "joao@example.com",
    mensagem: "Ótimo produto!",
    mensagem_locale: "pt-BR",
    notify_on_completion: false,
    notify_email: null,
    analysis_status: "pending",
    issue_draft: null,
    github_issue_number: null,
    github_issue_url: null,
    analyzed_at: null,
    created_at: "2026-01-01T12:00:00Z",
    attachment_count: 0,
    ...overrides,
  } as FeedbackWithMeta;
}

describe("FeedbackDrawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    window.open = jest.fn();
  });

  it("retorna null quando feedback é null", () => {
    const { container } = render(<FeedbackDrawer feedback={null} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza product_id, nome, email e mensagem", () => {
    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    expect(screen.getByText("kairos")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("joao@example.com")).toBeInTheDocument();
    expect(screen.getByText("Ótimo produto!")).toBeInTheDocument();
  });

  it("exibe badge 'Notificar' quando notify_on_completion=true", () => {
    render(<FeedbackDrawer feedback={makeFeedback({ notify_on_completion: true })} onClose={jest.fn()} />);
    expect(screen.getByText("Notificar")).toBeInTheDocument();
    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
  });

  it("exibe notify_email quando notify_on_completion=true e notify_email preenchido", () => {
    render(
      <FeedbackDrawer
        feedback={makeFeedback({ notify_on_completion: true, notify_email: "alerta@example.com" })}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText(/alerta@example\.com/)).toBeInTheDocument();
  });

  it("exibe 'Nenhum anexo' quando attachment_count=0", () => {
    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    expect(screen.getByText("Nenhum anexo.")).toBeInTheDocument();
  });

  it("exibe botão Carregar quando attachment_count > 0 e ainda não carregou", () => {
    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: /carregar/i })).toBeInTheDocument();
  });

  it("carrega e exibe lista de anexos ao clicar em Carregar (formatBytes < 1KB)", async () => {
    const att = { id: "a1", filename: "nota.txt", storage_path: "fb/a.txt", mime_type: "text/plain", size_bytes: 512 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ attachments: [att] }) });

    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar/i }));

    await waitFor(() => expect(screen.getByText("nota.txt")).toBeInTheDocument());
    expect(screen.getByText("512 B")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /carregar/i })).not.toBeInTheDocument();
  });

  it("exibe tamanho em KB para arquivos entre 1KB e 1MB (formatBytes KB)", async () => {
    const att = { id: "a2", filename: "planilha.xlsx", storage_path: "fb/b.xlsx", mime_type: "application/vnd.ms-excel", size_bytes: 3072 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ attachments: [att] }) });

    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar/i }));

    await waitFor(() => expect(screen.getByText("planilha.xlsx")).toBeInTheDocument());
    expect(screen.getByText("3 KB")).toBeInTheDocument();
  });

  it("exibe tamanho em MB para arquivos acima de 1MB (formatBytes MB)", async () => {
    const att = { id: "a3", filename: "video.mp4", storage_path: "fb/c.mp4", mime_type: "video/mp4", size_bytes: 1572864 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ attachments: [att] }) });

    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar/i }));

    await waitFor(() => expect(screen.getByText("video.mp4")).toBeInTheDocument());
    expect(screen.getByText("1.5 MB")).toBeInTheDocument();
  });

  it("não exibe anexos quando fetch de carregamento retorna erro", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar/i }));

    await waitFor(() => expect(screen.queryByRole("button", { name: /carregar/i })).not.toBeInTheDocument());
    expect(screen.queryByText(/\.txt/)).not.toBeInTheDocument();
  });

  it("busca URL assinada e abre no browser ao clicar em Baixar", async () => {
    const att = { id: "d1", filename: "doc.pdf", storage_path: "fb/doc.pdf", mime_type: "application/pdf", size_bytes: 100 };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ attachments: [att] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ url: "https://signed.url/doc.pdf" }) });

    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar/i }));
    await waitFor(() => screen.getByText("doc.pdf"));

    fireEvent.click(screen.getByRole("button", { name: /baixar/i }));
    await waitFor(() => expect(window.open).toHaveBeenCalledWith("https://signed.url/doc.pdf", "_blank"));
  });

  it("usa URL em cache na segunda vez que baixa o mesmo arquivo", async () => {
    const att = { id: "d2", filename: "img.png", storage_path: "fb/img.png", mime_type: "image/png", size_bytes: 100 };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ attachments: [att] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ url: "https://cached.url/img" }) });

    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar/i }));
    await waitFor(() => screen.getByText("img.png"));

    const dlBtn = screen.getByRole("button", { name: /baixar/i });
    fireEvent.click(dlBtn);
    await waitFor(() => expect(window.open).toHaveBeenCalledTimes(1));

    fireEvent.click(dlBtn);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(window.open).toHaveBeenCalledTimes(2);
  });

  it("exibe 'Erro' quando a busca da URL assinada falha", async () => {
    const att = { id: "d3", filename: "broken.pdf", storage_path: "fb/broken.pdf", mime_type: "application/pdf", size_bytes: 100 };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ attachments: [att] }) })
      .mockResolvedValueOnce({ ok: false });

    render(<FeedbackDrawer feedback={makeFeedback({ attachment_count: 1 })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /carregar/i }));
    await waitFor(() => screen.getByText("broken.pdf"));

    fireEvent.click(screen.getByRole("button", { name: /baixar/i }));
    await waitFor(() => expect(screen.getByText("Erro")).toBeInTheDocument());
  });

  it("exibe botão 'Analisar com IA' quando análise não realizada e sem issue", () => {
    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: /analisar com ia/i })).toBeInTheDocument();
  });

  it("exibe rascunho após análise bem-sucedida", async () => {
    const draft: IssueDraftJson = { classification: "bug", title: "Botão quebrado", body: "O botão não funciona", labels: ["bug"] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) });

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => expect(screen.getByDisplayValue("Botão quebrado")).toBeInTheDocument());
    expect(screen.getByDisplayValue("O botão não funciona")).toBeInTheDocument();
    expect(screen.getAllByText("bug").length).toBeGreaterThan(0);
  });

  it("exibe mensagem de erro quando análise falha", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Serviço indisponível" }),
    });

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => expect(screen.getByText("Serviço indisponível")).toBeInTheDocument());
  });

  it("exibe 'Analisando…' durante a análise", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));
    });

    expect(screen.getByText("Analisando…")).toBeInTheDocument();
  });

  it("permite editar o título do rascunho", async () => {
    const draft: IssueDraftJson = { classification: "improvement", title: "Original", body: "Body", labels: [] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) });

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => screen.getByDisplayValue("Original"));
    fireEvent.change(screen.getByDisplayValue("Original"), { target: { value: "Título Editado" } });
    expect(screen.getByDisplayValue("Título Editado")).toBeInTheDocument();
  });

  it("permite editar o body do rascunho", async () => {
    const draft: IssueDraftJson = { classification: "feature", title: "Feature X", body: "Corpo original", labels: [] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) });

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => screen.getByDisplayValue("Corpo original"));
    fireEvent.change(screen.getByDisplayValue("Corpo original"), { target: { value: "Corpo editado" } });
    expect(screen.getByDisplayValue("Corpo editado")).toBeInTheDocument();
  });

  it("botão 'Criar Issue' fica desabilitado quando título está vazio", async () => {
    const draft: IssueDraftJson = { classification: "bug", title: "Título", body: "Body", labels: [] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) });

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => screen.getByRole("button", { name: /criar issue/i }));
    fireEvent.change(screen.getByDisplayValue("Título"), { target: { value: "" } });
    expect(screen.getByRole("button", { name: /criar issue/i })).toBeDisabled();
  });

  it("exibe link da issue após criação bem-sucedida", async () => {
    const draft: IssueDraftJson = { classification: "bug", title: "Bug X", body: "Body", labels: ["bug"] };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ issueNumber: 42, issueUrl: "https://github.com/issues/42" }) });

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => screen.getByRole("button", { name: /criar issue/i }));
    fireEvent.click(screen.getByRole("button", { name: /criar issue/i }));

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /issue.*criada no github/i })).toHaveAttribute("href", "https://github.com/issues/42")
    );
  });

  it("exibe erro quando criação de issue falha", async () => {
    const draft: IssueDraftJson = { classification: "bug", title: "Bug", body: "Body", labels: [] };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Token inválido" }) });

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => screen.getByRole("button", { name: /criar issue/i }));
    fireEvent.click(screen.getByRole("button", { name: /criar issue/i }));

    await waitFor(() => expect(screen.getByText("Token inválido")).toBeInTheDocument());
  });

  it("exibe 'Criando…' durante a criação da issue", async () => {
    const draft: IssueDraftJson = { classification: "bug", title: "Bug", body: "Body", labels: [] };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) })
      .mockReturnValueOnce(new Promise(() => {}));

    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => screen.getByRole("button", { name: /criar issue/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /criar issue/i }));
    });

    expect(screen.getByText("Criando…")).toBeInTheDocument();
  });

  it("exibe link quando feedback já tem github_issue_number", () => {
    render(
      <FeedbackDrawer
        feedback={makeFeedback({ github_issue_number: 7, github_issue_url: "https://github.com/issues/7", analysis_status: "done" })}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole("link", { name: /issue.*criada no github/i })).toHaveAttribute("href", "https://github.com/issues/7");
  });

  it("não exibe botão 'Analisar' quando analysis_status=done", () => {
    render(<FeedbackDrawer feedback={makeFeedback({ analysis_status: "done" })} onClose={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /analisar com ia/i })).not.toBeInTheDocument();
  });

  it("exibe 'Análise anterior falhou' e botão de retry quando analysis_status=error", () => {
    render(<FeedbackDrawer feedback={makeFeedback({ analysis_status: "error" })} onClose={jest.fn()} />);
    expect(screen.getByText("Análise anterior falhou.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("botão 'Tentar novamente' dispara nova análise com sucesso", async () => {
    const draft: IssueDraftJson = { classification: "bug", title: "Bug reanalizado", body: "Body", labels: [] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ draft }) });

    render(<FeedbackDrawer feedback={makeFeedback({ analysis_status: "error" })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    await waitFor(() => expect(screen.getByDisplayValue("Bug reanalizado")).toBeInTheDocument());
  });

  it("inicializa com rascunho existente quando feedback.issue_draft está preenchido", () => {
    const draft: IssueDraftJson = { classification: "feature", title: "Feature existente", body: "Body existente", labels: ["enhancement"] };
    render(<FeedbackDrawer feedback={makeFeedback({ issue_draft: draft })} onClose={jest.fn()} />);
    expect(screen.getByDisplayValue("Feature existente")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Body existente")).toBeInTheDocument();
  });

  it("exibe rascunho (não link) quando issue_draft existe mas issue não foi criada", () => {
    const draft: IssueDraftJson = { classification: "bug", title: "Draft sem issue", body: "Body", labels: [] };
    render(
      <FeedbackDrawer
        feedback={makeFeedback({ issue_draft: draft, github_issue_number: null, github_issue_url: null })}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue("Draft sem issue")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /issue.*criada no github/i })).not.toBeInTheDocument();
  });

  it("chama onClose ao clicar no botão X", () => {
    const onClose = jest.fn();
    render(<FeedbackDrawer feedback={makeFeedback()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /fechar painel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao clicar no overlay de fundo", () => {
    const onClose = jest.fn();
    render(<FeedbackDrawer feedback={makeFeedback()} onClose={onClose} />);
    const overlay = document.querySelector('[role="presentation"]');
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renderiza AIDisclosureBadge na seção de análise IA", () => {
    render(<FeedbackDrawer feedback={makeFeedback()} onClose={jest.fn()} />);
    expect(screen.getByTestId("ai-badge")).toBeInTheDocument();
  });
});
