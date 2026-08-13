import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactsClient } from "@/app/admin/contacts/_components/ContactsClient";

jest.mock("@/app/admin/contacts/_components/ContactDrawer", () => ({
  ContactDrawer: ({ contact, onClose }: { contact: unknown; onClose: () => void }) => (
    <div data-testid="drawer" data-contact={contact ? "open" : "closed"}>
      <button onClick={onClose}>fechar-drawer</button>
    </div>
  ),
}));

const makeContact = (overrides = {}) => ({
  id: "id-1",
  name: "César Pizarro",
  email: "cesar@exemplo.com",
  project_type: "consulting",
  description: "Projeto de teste.",
  phone: null,
  whatsapp_preferred: false,
  status: "novo" as const,
  created_at: "2026-08-01T10:00:00Z",
  attachments: [],
  ...overrides,
});

describe("ContactsClient", () => {
  it("renderiza a lista de contatos", () => {
    render(<ContactsClient contacts={[makeContact()]} />);
    expect(screen.getByText("César Pizarro")).toBeInTheDocument();
    expect(screen.getByText("cesar@exemplo.com")).toBeInTheDocument();
  });

  it("exibe mensagem de lista vazia quando não há contatos", () => {
    render(<ContactsClient contacts={[]} />);
    expect(screen.getByText(/nenhuma solicitação/i)).toBeInTheDocument();
  });

  it("filtra contatos pelo campo de busca (nome)", () => {
    const contacts = [
      makeContact({ id: "1", name: "Alice Silva" }),
      makeContact({ id: "2", name: "Bob Santos" }),
    ];
    render(<ContactsClient contacts={contacts} />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "alice" } });
    expect(screen.getByText("Alice Silva")).toBeInTheDocument();
    expect(screen.queryByText("Bob Santos")).not.toBeInTheDocument();
  });

  it("filtra contatos pelo campo de busca (e-mail)", () => {
    const contacts = [
      makeContact({ id: "1", email: "alice@a.com" }),
      makeContact({ id: "2", email: "bob@b.com" }),
    ];
    render(<ContactsClient contacts={contacts} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "bob" } });
    expect(screen.queryByText("alice@a.com")).not.toBeInTheDocument();
    expect(screen.getByText("bob@b.com")).toBeInTheDocument();
  });

  it("filtra contatos por status ao clicar no botão de filtro", () => {
    const contacts = [
      makeContact({ id: "1", status: "novo" as const, name: "Novo Contato" }),
      makeContact({ id: "2", status: "respondido" as const, name: "Respondido Contato" }),
    ];
    render(<ContactsClient contacts={contacts} />);
    fireEvent.click(screen.getByRole("button", { name: /novos/i }));
    expect(screen.getByText("Novo Contato")).toBeInTheDocument();
    expect(screen.queryByText("Respondido Contato")).not.toBeInTheDocument();
  });

  it("exibe o número de anexos quando o contato tem arquivos", () => {
    const att = { id: "a1", contact_request_id: "id-1", filename: "doc.pdf", storage_path: "x", mime_type: "application/pdf", size_bytes: 1024, created_at: "" };
    render(<ContactsClient contacts={[makeContact({ attachments: [att] })]} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("abre o drawer ao clicar em uma linha da tabela", () => {
    render(<ContactsClient contacts={[makeContact()]} />);
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-contact", "closed");
    fireEvent.click(screen.getByText("César Pizarro"));
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-contact", "open");
  });

  it("fecha o drawer ao chamar onClose", () => {
    render(<ContactsClient contacts={[makeContact()]} />);
    fireEvent.click(screen.getByText("César Pizarro"));
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-contact", "open");
    fireEvent.click(screen.getByText("fechar-drawer"));
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-contact", "closed");
  });
});
