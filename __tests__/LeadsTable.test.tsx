import { render, screen, fireEvent } from "@testing-library/react";
import { LeadsTable } from "@/components/admin/LeadsTable";
import type { Database } from "@/lib/types";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];

function makeLeads(count: number): WaitlistRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    email: `lead${i}@test.com`,
    product_id: "devprint" as const,
    created_at: new Date(2025, 0, count - i).toISOString(),
  }));
}

const mockCreateObjectURL = jest.fn(() => "blob:mock");
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LeadsTable", () => {
  it("exibe mensagem quando não há leads", () => {
    render(<LeadsTable leads={[]} />);
    expect(screen.getByText("Nenhum lead cadastrado ainda.")).toBeInTheDocument();
  });

  it("exibe contagem de leads", () => {
    render(<LeadsTable leads={makeLeads(3)} />);
    expect(screen.getByText("3 leads no total")).toBeInTheDocument();
  });

  it("exibe contagem quando há 1 lead", () => {
    render(<LeadsTable leads={makeLeads(1)} />);
    expect(screen.getByText("1 leads no total")).toBeInTheDocument();
  });

  it.each(["E-mail", "Produto", "Data de Cadastro"])(
    "renderiza o cabeçalho '%s'",
    (header) => {
      render(<LeadsTable leads={makeLeads(1)} />);
      expect(screen.getByText(header)).toBeInTheDocument();
    }
  );

  it("renderiza e-mail e produto do lead", () => {
    render(<LeadsTable leads={makeLeads(1)} />);
    expect(screen.getByText("lead0@test.com")).toBeInTheDocument();
    expect(screen.getByText("DevPrint")).toBeInTheDocument();
  });

  it("não exibe paginação com 10 ou menos leads", () => {
    render(<LeadsTable leads={makeLeads(10)} />);
    expect(screen.queryByText("Anterior")).not.toBeInTheDocument();
    expect(screen.queryByText("Próxima")).not.toBeInTheDocument();
  });

  it("exibe paginação com mais de 10 leads", () => {
    render(<LeadsTable leads={makeLeads(11)} />);
    expect(screen.getByText("Anterior")).toBeInTheDocument();
    expect(screen.getByText("Próxima")).toBeInTheDocument();
  });

  it("botão Anterior está desabilitado na primeira página", () => {
    render(<LeadsTable leads={makeLeads(11)} />);
    expect(screen.getByText("Anterior")).toBeDisabled();
  });

  it("botão Próxima está desabilitado na última página", () => {
    render(<LeadsTable leads={makeLeads(11)} />);
    fireEvent.click(screen.getByText("Próxima"));
    expect(screen.getByText("Próxima")).toBeDisabled();
  });

  it("exibe 10 linhas na primeira página com 15 leads", () => {
    render(<LeadsTable leads={makeLeads(15)} />);
    const rows = screen.getAllByText(/lead\d+@test\.com/);
    expect(rows).toHaveLength(10);
  });

  it("avança para a segunda página corretamente", () => {
    render(<LeadsTable leads={makeLeads(15)} />);
    fireEvent.click(screen.getByText("Próxima"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    const rows = screen.getAllByText(/lead\d+@test\.com/);
    expect(rows).toHaveLength(5);
  });

  it("volta para a primeira página com botão Anterior", () => {
    render(<LeadsTable leads={makeLeads(15)} />);
    fireEvent.click(screen.getByText("Próxima"));
    fireEvent.click(screen.getByText("Anterior"));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("botão Exportar CSV dispara download", () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<LeadsTable leads={makeLeads(3)} />);
    fireEvent.click(screen.getByText("Exportar CSV"));
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it("CSV exportado contém cabeçalho correto", () => {
    let capturedContent = "";
    const OriginalBlob = global.Blob;
    jest.spyOn(global, "Blob").mockImplementation((parts) => {
      capturedContent = (parts as string[]).join("");
      return new OriginalBlob(parts);
    });
    jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<LeadsTable leads={makeLeads(1)} />);
    fireEvent.click(screen.getByText("Exportar CSV"));

    expect(capturedContent).toContain("email,produto,data_cadastro");
    expect(capturedContent).toContain("lead0@test.com");
    expect(capturedContent).toContain("DevPrint");
  });
});
