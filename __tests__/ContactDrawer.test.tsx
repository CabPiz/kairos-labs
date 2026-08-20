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

  it("mostra 'Analisando…' após trigger com sucesso e inicia polling", async () => {
    mockTriggerContactAnalysis.mockResolvedValue(undefined);

    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => expect(screen.getByText("Analisando…")).toBeInTheDocument());
    expect(mockTriggerContactAnalysis).toHaveBeenCalledWith("c-001");
  });

  it("exibe erro inline quando triggerContactAnalysis lança (sem crash para Error Boundary)", async () => {
    mockTriggerContactAnalysis.mockRejectedValue(new Error("Serviço fora do ar"));

    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => expect(screen.getByText(/serviço fora do ar/i)).toBeInTheDocument());
    expect(screen.getByText(/erro na análise/i)).toBeInTheDocument();
    // Após erro o botão mostra "Reanalisar" (isError=true), não "Analisar com IA"
    expect(screen.getByRole("button", { name: /reanalisar/i })).toBeInTheDocument();
  });

  it("usa mensagem genérica quando o erro não é instância de Error", async () => {
    mockTriggerContactAnalysis.mockRejectedValue("falha desconhecida");

    render(<ContactDrawer contact={makeContact()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /analisar com ia/i }));

    await waitFor(() => expect(screen.getByText(/erro ao iniciar análise/i)).toBeInTheDocument());
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
