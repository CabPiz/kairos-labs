import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContactDrawer } from "@/app/admin/contacts/_components/ContactDrawer";

const mockMarkContactViewed = jest.fn();
const mockGetAttachmentSignedUrl = jest.fn();
const mockGetContactAnalysis = jest.fn();
const mockTriggerContactAnalysis = jest.fn();
const mockCreateGitHubIssue = jest.fn();

jest.mock("@/app/admin/contacts/actions", () => ({
  markContactViewed: (...args: unknown[]) => mockMarkContactViewed(...args),
  getAttachmentSignedUrl: (...args: unknown[]) => mockGetAttachmentSignedUrl(...args),
  getContactAnalysis: (...args: unknown[]) => mockGetContactAnalysis(...args),
  triggerContactAnalysis: (...args: unknown[]) => mockTriggerContactAnalysis(...args),
  createGitHubIssue: (...args: unknown[]) => mockCreateGitHubIssue(...args),
}));

const makeContact = (overrides = {}) => ({
  id: "id-1",
  name: "César Pizarro",
  email: "cesar@exemplo.com",
  project_type: "consulting",
  description: "Descrição do projeto de teste.",
  phone: null,
  whatsapp_preferred: false,
  status: "novo" as const,
  created_at: "2026-08-01T10:00:00Z",
  attachments: [],
  ...overrides,
});

const analysisDone = {
  contact_request_id: "id-1",
  status: "done",
  problema: "Empresa sem sistema de gestão",
  solucao_tipo: "novo_produto",
  solucao_titulo: "SaaS de Gestão",
  solucao_descricao: "Plataforma para gestão",
  nichos: [
    { publico: "MEIs", justificativa: "Alta demanda" },
    { publico: "Freelancers", justificativa: "Necessidade de organização" },
  ],
  draft_issues: [{ title: "feat: módulo de finanças", body: "Descrição da issue", labels: ["type: feature"] }],
  attachments_used: ["proposta.pdf"],
  error_message: null,
  github_issue_url: null,
  github_issue_number: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("ContactDrawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkContactViewed.mockResolvedValue(undefined);
    mockGetContactAnalysis.mockResolvedValue(null);
    mockTriggerContactAnalysis.mockResolvedValue(undefined);
    mockCreateGitHubIssue.mockResolvedValue({ url: "https://github.com/issue/1", number: 1 });
    mockGetAttachmentSignedUrl.mockResolvedValue("https://example.com/signed");
  });

  it("fica oculto (translateX(100%)) quando contact é null", () => {
    const { container } = render(<ContactDrawer contact={null} onClose={jest.fn()} />);
    const aside = container.querySelector("aside");
    expect(aside).toHaveStyle("transform: translateX(100%)");
  });

  it("fica visível (translateX(0)) quando contact é fornecido", () => {
    const { container } = render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    const aside = container.querySelector("aside");
    expect(aside).toHaveStyle("transform: translateX(0)");
  });

  it("renderiza nome e e-mail do contato", () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    expect(screen.getByText("César Pizarro")).toBeInTheDocument();
    expect(screen.getByText("cesar@exemplo.com")).toBeInTheDocument();
  });

  it("renderiza a descrição do contato", () => {
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    expect(screen.getByText("Descrição do projeto de teste.")).toBeInTheDocument();
  });

  it("chama markContactViewed quando status é novo", async () => {
    render(<ContactDrawer contact={makeContact({ status: "novo" })} onClose={jest.fn()} />);
    await waitFor(() => expect(mockMarkContactViewed).toHaveBeenCalledWith("id-1"));
  });

  it("não chama markContactViewed quando status não é novo", async () => {
    render(<ContactDrawer contact={makeContact({ status: "visualizado" })} onClose={jest.fn()} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(mockMarkContactViewed).not.toHaveBeenCalled();
  });

  it("chama onClose ao clicar no botão fechar", () => {
    const onClose = jest.fn();
    render(<ContactDrawer contact={makeContact()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("exibe mensagem de sem anexos quando attachments está vazio", () => {
    render(<ContactDrawer contact={makeContact({ attachments: [] })} onClose={jest.fn()} />);
    expect(screen.getByText(/nenhum anexo/i)).toBeInTheDocument();
  });

  it("renderiza botão de download para cada anexo", () => {
    const att = { id: "att-1", contact_request_id: "id-1", filename: "doc.pdf", storage_path: "path/doc.pdf", mime_type: "application/pdf", size_bytes: 2048, created_at: "" };
    render(<ContactDrawer contact={makeContact({ attachments: [att] })} onClose={jest.fn()} />);
    expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /baixar doc\.pdf/i })).toBeInTheDocument();
  });

  it("chama getAttachmentSignedUrl ao clicar em baixar e abre nova aba", async () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    const att = { id: "att-1", contact_request_id: "id-1", filename: "doc.pdf", storage_path: "path/doc.pdf", mime_type: "application/pdf", size_bytes: 1024, created_at: "" };
    render(<ContactDrawer contact={makeContact({ attachments: [att] })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /baixar doc\.pdf/i }));
    await waitFor(() => expect(openSpy).toHaveBeenCalledWith("https://example.com/signed", "_blank", "noopener,noreferrer"));
    openSpy.mockRestore();
  });

  it("exibe erro de URL quando getAttachmentSignedUrl retorna null", async () => {
    mockGetAttachmentSignedUrl.mockResolvedValue(null);
    const att = { id: "att-1", contact_request_id: "id-1", filename: "doc.pdf", storage_path: "path/doc.pdf", mime_type: "application/pdf", size_bytes: 1024, created_at: "" };
    render(<ContactDrawer contact={makeContact({ attachments: [att] })} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /baixar doc\.pdf/i }));
    await waitFor(() => expect(screen.getByText(/erro ao gerar link/i)).toBeInTheDocument());
  });

  it("renderiza telefone quando fornecido", () => {
    render(<ContactDrawer contact={makeContact({ phone: "11999999999" })} onClose={jest.fn()} />);
    expect(screen.getByText("11999999999")).toBeInTheDocument();
  });
});

// ─── AnalysisPanel — via ContactDrawer ────────────────────────────────────────

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
    await waitFor(() => expect(mockGetContactAnalysis).toHaveBeenCalledWith("id-1"));
  });

  it("exibe botão 'Analisar com IA' quando não há análise", async () => {
    mockGetContactAnalysis.mockResolvedValue(null);
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /analisar com ia/i })).toBeInTheDocument());
  });

  it("exibe spinner de análise quando status=analyzing", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "analyzing" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/analisando/i)).toBeInTheDocument());
  });

  it("exibe spinner de análise quando status=pending", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "pending" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/analisando/i)).toBeInTheDocument());
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
    await waitFor(() => expect(mockTriggerContactAnalysis).toHaveBeenCalledWith("id-1"));
  });

  it("chama triggerContactAnalysis ao clicar em 'Reanalisar' (status=error)", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "error", error_message: null });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByRole("button", { name: /reanalisar/i }));
    fireEvent.click(screen.getByRole("button", { name: /reanalisar/i }));
    await waitFor(() => expect(mockTriggerContactAnalysis).toHaveBeenCalledWith("id-1"));
  });

  it("não exibe trigger button quando status=analyzing", async () => {
    mockGetContactAnalysis.mockResolvedValue({ ...analysisDone, status: "analyzing" });
    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    await waitFor(() => screen.getByText(/analisando/i));
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
      expect(mockCreateGitHubIssue).toHaveBeenCalledWith("id-1", {
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
