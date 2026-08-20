import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/components/legal/AIDisclosureBadge", () => ({
  AIDisclosureBadge: () => <span data-testid="ai-badge" />,
}));

jest.mock("lucide-react", () => ({
  X: () => null,
  Paperclip: () => null,
  Download: () => null,
  Loader2: () => null,
  Sparkles: () => null,
  ExternalLink: () => null,
}));

const mockMarkContactViewed = jest.fn();
const mockGetAttachmentSignedUrl = jest.fn();
const mockTriggerContactAnalysis = jest.fn();
const mockGetContactAnalysis = jest.fn();
const mockCreateGitHubIssue = jest.fn();

jest.mock("@/app/admin/contacts/actions", () => ({
  markContactViewed: (...args: unknown[]) => mockMarkContactViewed(...args),
  getAttachmentSignedUrl: (...args: unknown[]) => mockGetAttachmentSignedUrl(...args),
  triggerContactAnalysis: (...args: unknown[]) => mockTriggerContactAnalysis(...args),
  getContactAnalysis: (...args: unknown[]) => mockGetContactAnalysis(...args),
  createGitHubIssue: (...args: unknown[]) => mockCreateGitHubIssue(...args),
}));

import { ContactDrawer } from "@/app/admin/contacts/_components/ContactDrawer";
import type { Database } from "@/lib/types";

type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];
type ContactAttachment = Database["public"]["Tables"]["contact_attachments"]["Row"];

function makeContact(overrides: Partial<ContactRequest & { attachments: ContactAttachment[] }> = {}) {
  return {
    id: "c-001",
    name: "Beatriz Costa",
    email: "beatriz@exemplo.com",
    project_type: "saas",
    description: "Preciso de um sistema de agendamento.",
    phone: null,
    whatsapp_preferred: false,
    status: "visualizado" as const,
    created_at: "2026-08-01T12:00:00Z",
    attachments: [] as ContactAttachment[],
    ...overrides,
  };
}

const analysisDone = {
  id: "a-001",
  contact_request_id: "c-001",
  status: "done" as const,
  problema: "Empresa sem sistema de gestão",
  solucao_tipo: "novo_produto" as const,
  solucao_titulo: "SaaS de Gestão",
  solucao_descricao: "Plataforma para gestão",
  nichos: [
    { publico: "MEIs", justificativa: "Alta demanda" },
    { publico: "Freelancers", justificativa: "Alta flexibilidade" },
  ],
  draft_issues: [
    { title: "feat: módulo de finanças", body: "Descrição da issue", labels: ["type: feature"] },
  ],
  attachments_used: ["proposta.pdf"],
  github_issue_url: null,
  github_issue_number: null,
  error_message: null,
  current_step: null,
  created_at: "2026-08-01T12:00:00Z",
};

describe("ContactDrawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockMarkContactViewed.mockResolvedValue(undefined);
    mockGetContactAnalysis.mockResolvedValue(null);
    mockTriggerContactAnalysis.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("não renderiza conteúdo quando contact é null", () => {
    const { container } = render(<ContactDrawer contact={null} onClose={jest.fn()} />);
    expect(container.querySelector("aside")).toBeInTheDocument();
    expect(container.querySelector("aside")?.textContent).toBe("");
  });

  it("renderiza nome, email e descrição do contato", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    expect(screen.getByText("Beatriz Costa")).toBeInTheDocument();
    expect(screen.getByText("beatriz@exemplo.com")).toBeInTheDocument();
    expect(screen.getByText("Preciso de um sistema de agendamento.")).toBeInTheDocument();
  });

  it("chama markContactViewed quando status é 'novo'", async () => {
    render(<ContactDrawer contact={makeContact({ status: "novo" })} onClose={jest.fn()} />);
    await waitFor(() => expect(mockMarkContactViewed).toHaveBeenCalledWith("c-001"));
  });

  it("não chama markContactViewed quando status não é 'novo'", () => {
    render(<ContactDrawer contact={makeContact({ status: "visualizado" })} onClose={jest.fn()} />);
    expect(mockMarkContactViewed).not.toHaveBeenCalled();
  });

  it("exibe botão 'Analisar com IA' quando não há análise prévia", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: /analisar com ia/i })).toBeInTheDocument();
  });

  it("mostra etapas do pipeline após trigger com sucesso e inicia polling", async () => {
    mockTriggerContactAnalysis.mockResolvedValue(undefined);

    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => expect(screen.getByText(/buscando dados do contato/i)).toBeInTheDocument());
    expect(mockTriggerContactAnalysis).toHaveBeenCalledWith("c-001");
  });

  it("exibe erro inline quando triggerContactAnalysis lança (sem crash para Error Boundary)", async () => {
    mockTriggerContactAnalysis.mockRejectedValue(new Error("Serviço fora do ar"));

    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    // Em produção Next.js sanitiza Server Action errors — componente usa mensagem fixa
    await waitFor(() => expect(screen.getByRole("button", { name: /reanalisar/i })).toBeInTheDocument());
    expect(screen.getByText(/erro na análise/i)).toBeInTheDocument();
    expect(screen.getByText(/erro ao iniciar análise/i)).toBeInTheDocument();
  });

  it("usa mensagem fixa independente do tipo de erro lançado", async () => {
    mockTriggerContactAnalysis.mockRejectedValue("falha desconhecida");

    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /reanalisar/i })).toBeInTheDocument());
    expect(screen.getByText(/erro ao iniciar análise/i)).toBeInTheDocument();
  });

  it("chama onClose ao clicar no botão de fechar", () => {
    const onClose = jest.fn();
    render(<ContactDrawer contact={makeContact()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao clicar no overlay de fundo", () => {
    const onClose = jest.fn();
    render(<ContactDrawer contact={makeContact()} onClose={onClose} />);
    const overlay = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("exibe badge WhatsApp quando whatsapp_preferred é true", () => {
    render(<ContactDrawer contact={makeContact({ whatsapp_preferred: true })} onClose={jest.fn()} />);
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
  });

  it("exibe 'Nenhum anexo.' quando não há anexos", () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    expect(screen.getByText("Nenhum anexo.")).toBeInTheDocument();
  });

  it("renderiza AIDisclosureBadge na seção de análise", () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    expect(screen.getByTestId("ai-badge")).toBeInTheDocument();
  });

  it("não exibe crash quando getContactAnalysis lança durante loadAnalysis", async () => {
    mockGetContactAnalysis.mockRejectedValue(new Error("Falha de rede"));

    const { container } = render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);

    await waitFor(() => expect(mockGetContactAnalysis).toHaveBeenCalled());
    // A UI não deve crashar — o botão de trigger ainda deve estar presente
    expect(container.querySelector("aside")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analisar com ia/i })).toBeInTheDocument();
  });
});

describe("AnalysisPanel — via ContactDrawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkContactViewed.mockResolvedValue(undefined);
    mockGetContactAnalysis.mockResolvedValue(null);
    mockTriggerContactAnalysis.mockResolvedValue(undefined);
    mockCreateGitHubIssue.mockResolvedValue({ url: "https://github.com/issue/1", number: 1 });
    mockGetAttachmentSignedUrl.mockResolvedValue("https://example.com/signed");
  });

  it("chama getContactAnalysis ao montar", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetContactAnalysis).toHaveBeenCalledWith("c-001"));
  });

  it("exibe botão 'Analisar com IA' quando não há análise", async () => {
    mockGetContactAnalysis.mockResolvedValue(null);
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /analisar com ia/i })).toBeInTheDocument());
  });

  it("exibe etapas do pipeline quando status=analyzing", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "analyzing" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/buscando dados do contato/i)).toBeInTheDocument());
  });

  it("exibe etapas do pipeline quando status=pending", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "pending" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/buscando dados do contato/i)).toBeInTheDocument());
  });

  it("exibe botão 'Reanalisar' quando status=error", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "error", error_message: "falhou" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /reanalisar/i })).toBeInTheDocument());
  });

  it("exibe mensagem de erro quando status=error com error_message", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "error", error_message: "algo falhou" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/algo falhou/)).toBeInTheDocument());
  });

  it("exibe problema e solução quando status=done", async () => {
    mockGetContactAnalysis.mockResolvedValue(analysisDone);
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText("Empresa sem sistema de gestão")).toBeInTheDocument());
    expect(screen.getByText("SaaS de Gestão")).toBeInTheDocument();
    expect(screen.getByText("Plataforma para gestão")).toBeInTheDocument();
  });

  it("exibe nichos de mercado quando status=done", async () => {
    mockGetContactAnalysis.mockResolvedValue(analysisDone);
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText("MEIs")).toBeInTheDocument());
    expect(screen.getByText("Alta demanda")).toBeInTheDocument();
    expect(screen.getByText("Freelancers")).toBeInTheDocument();
  });

  it("exibe attachments_used quando status=done", async () => {
    mockGetContactAnalysis.mockResolvedValue(analysisDone);
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => {
      const items = screen.getAllByText("proposta.pdf");
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it("exibe tipo 'Novo produto' na análise concluída", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, solucao_tipo: "novo_produto" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/novo produto/i)).toBeInTheDocument());
  });

  it("exibe tipo 'Aprimoramento' para solucao_tipo=aprimoramento", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, solucao_tipo: "aprimoramento" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/aprimoramento/i)).toBeInTheDocument());
  });

  it("chama triggerContactAnalysis ao clicar em 'Analisar com IA'", async () => {
    mockGetContactAnalysis.mockResolvedValue(null);
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("button", { name: /analisar com ia/i }));
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));
    await waitFor(() => expect(mockTriggerContactAnalysis).toHaveBeenCalledWith("c-001"));
  });

  it("chama triggerContactAnalysis ao clicar em 'Reanalisar' (status=error)", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "error", error_message: null });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("button", { name: /reanalisar/i }));
    fireEvent.click(screen.getByRole("button", { name: /reanalisar/i }));
    await waitFor(() => expect(mockTriggerContactAnalysis).toHaveBeenCalledWith("c-001"));
  });

  it("não exibe trigger button quando status=analyzing", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "analyzing" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByText(/buscando dados do contato/i));
    expect(screen.queryByRole("button", { name: /analisar com ia/i })).not.toBeInTheDocument();
  });
});

// ─── IssueDraftEditor — via ContactDrawer com análise concluída ───────────────

describe("IssueDraftEditor — via ContactDrawer com análise concluída", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkContactViewed.mockResolvedValue(undefined);
    mockGetContactAnalysis.mockResolvedValue(analysisDone);
    mockTriggerContactAnalysis.mockResolvedValue(undefined);
    mockCreateGitHubIssue.mockResolvedValue({ url: "https://github.com/issue/1", number: 1 });
    mockGetAttachmentSignedUrl.mockResolvedValue("https://example.com/signed");
  });

  it("renderiza input de título com o valor do draft", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByDisplayValue("feat: módulo de finanças")).toBeInTheDocument());
  });

  it("renderiza textarea de corpo com o valor do draft", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByDisplayValue("Descrição da issue")).toBeInTheDocument());
  });

  it("renderiza labels do draft", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText("type: feature")).toBeInTheDocument());
  });

  it("exibe checkbox de revisão antes da criação", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/revise e edite/i)).toBeInTheDocument());
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("botão 'Criar issue' desabilitado sem checkbox marcado", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("button", { name: /criar issue/i }));
    expect(screen.getByRole("button", { name: /criar issue/i })).toBeDisabled();
  });

  it("botão 'Criar issue' habilitado após marcar checkbox", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("button", { name: /criar issue/i })).not.toBeDisabled();
  });

  it("chama createGitHubIssue com dados corretos após revisão", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /criar issue/i }));
    await waitFor(() =>
      expect(mockCreateGitHubIssue).toHaveBeenCalledWith("c-001", {
        title: "feat: módulo de finanças",
        body: "Descrição da issue",
        labels: ["type: feature"],
      }),
    );
  });

  it("exibe link 'Issue criada' após criação bem-sucedida", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /criar issue/i }));
    await waitFor(() => expect(screen.getByText(/issue criada/i)).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /issue criada/i })).toHaveAttribute(
      "href",
      "https://github.com/issue/1",
    );
  });

  it("oculta checkbox após criação da issue", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /criar issue/i }));
    await waitFor(() => expect(screen.queryByRole("checkbox")).not.toBeInTheDocument());
  });

  it("atualiza título do draft ao editar input", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByDisplayValue("feat: módulo de finanças"));
    fireEvent.change(screen.getByDisplayValue("feat: módulo de finanças"), {
      target: { value: "feat: novo título" },
    });
    expect(screen.getByDisplayValue("feat: novo título")).toBeInTheDocument();
  });

  it("atualiza corpo do draft ao editar textarea", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByDisplayValue("Descrição da issue"));
    fireEvent.change(screen.getByDisplayValue("Descrição da issue"), {
      target: { value: "Nova descrição" },
    });
    expect(screen.getByDisplayValue("Nova descrição")).toBeInTheDocument();
  });

  it("handleCreate não chama createGitHubIssue se revisão não marcada", async () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("button", { name: /criar issue/i }));
    fireEvent.click(screen.getByRole("button", { name: /criar issue/i }));
    await new Promise((r) => setTimeout(r, 50));
    expect(mockCreateGitHubIssue).not.toHaveBeenCalled();
  });

  it("renderiza múltiplos IssueDraftEditor quando há vários drafts", async () => {
    const multiDraft = {
      ...analysisDone,
      draft_issues: [
        { title: "feat: módulo de finanças", body: "Corpo 1", labels: ["type: feature"] },
        { title: "feat: módulo de clientes", body: "Corpo 2", labels: ["type: enhancement"] },
      ],
    };
    mockGetContactAnalysis.mockResolvedValue(multiDraft);
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByDisplayValue("feat: módulo de finanças")).toBeInTheDocument());
    expect(screen.getByDisplayValue("feat: módulo de clientes")).toBeInTheDocument();
  });
});
