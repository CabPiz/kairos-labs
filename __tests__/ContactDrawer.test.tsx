import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContactDrawer } from "@/app/admin/contacts/_components/ContactDrawer";

const mockMarkContactViewed = jest.fn();
const mockGetAttachmentSignedUrl = jest.fn();

jest.mock("@/app/admin/contacts/actions", () => ({
  markContactViewed: (...args: unknown[]) => mockMarkContactViewed(...args),
  getAttachmentSignedUrl: (...args: unknown[]) => mockGetAttachmentSignedUrl(...args),
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

describe("ContactDrawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkContactViewed.mockResolvedValue(undefined);
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
