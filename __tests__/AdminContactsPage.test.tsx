import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("server-only", () => ({}));

const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockIn = jest.fn();
const mockFrom = jest.fn();
const mockAdminClient = { from: mockFrom };

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

jest.mock("@/components/admin/AdminLanguageSwitcher", () => ({
  AdminLanguageSwitcher: () => <div data-testid="admin-language-switcher" />,
}));

jest.mock("@/app/admin/contacts/_components/ContactsClient", () => ({
  ContactsClient: ({ contacts }: { contacts: { id: string; attachments: unknown[] }[] }) => (
    <div data-testid="contacts-client">{contacts.length} contacts</div>
  ),
}));

import AdminContactsPage from "@/app/admin/contacts/page";

const makeRequest = (id: string, name = "Test") => ({
  id,
  name,
  email: "test@example.com",
  project_type: "web",
  description: "desc",
  phone: null,
  whatsapp_preferred: false,
  status: "novo",
  created_at: "2026-08-01T00:00:00Z",
});

const makeAttachment = (id: string, contactRequestId: string) => ({
  id,
  contact_request_id: contactRequestId,
  filename: "doc.pdf",
  storage_path: "path/doc.pdf",
  mime_type: "application/pdf",
  size_bytes: 1024,
  created_at: "2026-08-01T00:00:00Z",
});

describe("AdminContactsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockOrder.mockResolvedValue({ data: [] });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockIn.mockResolvedValue({ data: [] });

    mockFrom.mockImplementation((table: string) => {
      if (table === "contact_requests") return { select: mockSelect };
      if (table === "contact_attachments") return { select: jest.fn().mockReturnValue({ in: mockIn }) };
      return {};
    });
  });

  it("renderiza a página com título de contatos", async () => {
    render(await AdminContactsPage());
    expect(screen.getByText(/solicitações de contato/i)).toBeInTheDocument();
  });

  it("passa lista vazia ao ContactsClient quando não há registros", async () => {
    render(await AdminContactsPage());
    expect(screen.getByTestId("contacts-client")).toHaveTextContent("0 contacts");
  });

  it("passa contatos ao ContactsClient quando há registros sem anexos", async () => {
    mockOrder.mockResolvedValue({ data: [makeRequest("id-1")] });
    render(await AdminContactsPage());
    expect(screen.getByTestId("contacts-client")).toHaveTextContent("1 contacts");
  });

  it("associa anexos aos contatos corretos pelo contact_request_id", async () => {
    const req1 = makeRequest("id-1", "Alice");
    const req2 = makeRequest("id-2", "Bob");
    mockOrder.mockResolvedValue({ data: [req1, req2] });
    mockIn.mockResolvedValue({ data: [makeAttachment("att-1", "id-1"), makeAttachment("att-2", "id-1")] });

    const { getByTestId } = render(await AdminContactsPage());
    expect(getByTestId("contacts-client")).toHaveTextContent("2 contacts");
  });

  it("não consulta contact_attachments quando não há contact_requests", async () => {
    mockOrder.mockResolvedValue({ data: [] });
    render(await AdminContactsPage());
    expect(mockFrom).not.toHaveBeenCalledWith("contact_attachments");
  });
});
