import React from "react";
import { render, screen } from "@testing-library/react";
import type { Database } from "@/lib/types";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];
type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];

jest.mock("server-only", () => ({}));

const mockRpc = jest.fn();

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(() =>
    Promise.resolve({ rpc: mockRpc })
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("@/components/admin/KPICard", () => ({
  KPICard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="kpi-card">{label}: {value}</div>
  ),
}));

jest.mock("@/components/admin/DemandChart", () => ({
  DemandChart: () => <div data-testid="demand-chart" />,
}));

jest.mock("@/components/admin/LeadsTable", () => ({
  LeadsTable: ({ leads }: { leads: unknown[] }) => (
    <div data-testid="leads-table">{leads.length} leads</div>
  ),
}));

function makeKpis(
  leads: Partial<WaitlistRow>[] = [],
  recentCount = 0,
  feedback: Partial<FeedbackRow>[] = []
) {
  return {
    all_leads: leads.map((l, i) => ({
      id: `id-${i}`,
      email: `lead${i}@test.com`,
      product_id: "devprint",
      created_at: new Date(2026, 0, i + 1).toISOString(),
      ...l,
    })),
    recent_count: recentCount,
    all_feedback: feedback.map((f, i) => ({
      id: `fb-${i}`,
      product_id: "devprint",
      nome: null,
      email: null,
      mensagem: `Sugestão ${i}`,
      created_at: new Date(2026, 0, i + 1).toISOString(),
      ...f,
    })),
  };
}

async function renderAdminPage() {
  const AdminPage = (await import("@/app/admin/page")).default;
  render(await AdminPage());
}

describe("AdminPage", () => {
  beforeEach(() => {
    jest.resetModules();
    mockRpc.mockReset();
  });

  it("renderiza o título do dashboard", async () => {
    mockRpc.mockResolvedValue({ data: makeKpis() });
    await renderAdminPage();
    expect(screen.getByText("Founder Dashboard")).toBeInTheDocument();
  });

  it("exibe KPI de total na waitlist", async () => {
    mockRpc.mockResolvedValue({ data: makeKpis([{}, {}], 2) });
    await renderAdminPage();
    expect(screen.getByText(/Total na Waitlist/)).toBeInTheDocument();
    expect(screen.getByText(/Total na Waitlist:.*2/)).toBeInTheDocument();
  });

  it("exibe contagem de inscritos nos últimos 7 dias via recent_count", async () => {
    mockRpc.mockResolvedValue({ data: makeKpis([{}], 1) });
    await renderAdminPage();
    expect(screen.getByText(/Últimos 7 dias/)).toBeInTheDocument();
  });

  it("exibe o produto de maior demanda", async () => {
    mockRpc.mockResolvedValue({
      data: makeKpis([
        { product_id: "devprint" },
        { product_id: "devprint" },
        { product_id: "ascend" },
      ], 3),
    });
    await renderAdminPage();
    expect(screen.getByText(/Maior Demanda/)).toBeInTheDocument();
    expect(screen.getByText(/DevPrint/)).toBeInTheDocument();
  });

  it("exibe mensagem quando não há sugestões", async () => {
    mockRpc.mockResolvedValue({ data: makeKpis() });
    await renderAdminPage();
    expect(screen.getByText("Nenhuma sugestão recebida ainda.")).toBeInTheDocument();
  });

  it("exibe sugestões recebidas quando há feedback", async () => {
    mockRpc.mockResolvedValue({
      data: makeKpis([], 0, [{ mensagem: "Ótimo produto!" }]),
    });
    await renderAdminPage();
    expect(screen.getByText("Ótimo produto!")).toBeInTheDocument();
    expect(screen.getByText("Sugestões Recebidas (1)")).toBeInTheDocument();
  });

  it("renderiza com data nula do RPC sem quebrar", async () => {
    mockRpc.mockResolvedValue({ data: null });
    await renderAdminPage();
    expect(screen.getByText("Founder Dashboard")).toBeInTheDocument();
  });
});
