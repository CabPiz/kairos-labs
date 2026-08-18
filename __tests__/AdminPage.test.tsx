import React from "react";
import { render, screen } from "@testing-library/react";
import type { Database, FeedbackWithMeta } from "@/lib/types";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];

jest.mock("server-only", () => ({}));

const mockRpc = jest.fn();
const mockAdminRpc = jest.fn();

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(() =>
    Promise.resolve({ rpc: mockRpc })
  ),
  createServerAdminClient: jest.fn(() => ({ rpc: mockAdminRpc })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("@/components/admin/AdminLanguageSwitcher", () => ({
  AdminLanguageSwitcher: () => <div data-testid="admin-language-switcher" />,
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

jest.mock("@/components/admin/FeedbackList", () => ({
  FeedbackList: ({
    feedbacks,
    noFeedbackText,
  }: {
    feedbacks: FeedbackWithMeta[];
    locale: string;
    noFeedbackText: string;
  }) =>
    feedbacks.length === 0 ? (
      <p>{noFeedbackText}</p>
    ) : (
      <div data-testid="feedback-list">
        {feedbacks.map((f) => (
          <p key={f.id}>{f.mensagem}</p>
        ))}
      </div>
    ),
}));

function makeLeads(count: number, overrides: Partial<WaitlistRow> = {}): WaitlistRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    email: `lead${i}@test.com`,
    product_id: "devprint",
    created_at: new Date(2026, 0, i + 1).toISOString(),
    ...overrides,
  }));
}

function makeKpis(leads: WaitlistRow[] = [], recentCount = 0) {
  return { all_leads: leads, recent_count: recentCount };
}

function makeFeedbackMeta(overrides: Partial<FeedbackWithMeta> & { mensagem?: string } = {}, i = 0): FeedbackWithMeta {
  return {
    id: `fb-${i}`,
    product_id: "devprint",
    nome: null,
    email: null,
    mensagem: `Sugestão ${i}`,
    mensagem_locale: null,
    notify_on_completion: false,
    notify_email: null,
    analysis_status: null,
    issue_draft: null,
    github_issue_number: null,
    github_issue_url: null,
    analyzed_at: null,
    created_at: new Date(2026, 0, i + 1).toISOString(),
    attachment_count: 0,
    ...overrides,
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
    mockAdminRpc.mockReset();
    mockRpc.mockResolvedValue({ data: makeKpis() });
    mockAdminRpc.mockResolvedValue({ data: [] });
  });

  it("renderiza o título do dashboard", async () => {
    await renderAdminPage();
    expect(screen.getByText("Founder Dashboard")).toBeInTheDocument();
  });

  it("exibe KPI de total na waitlist", async () => {
    mockRpc.mockResolvedValue({ data: makeKpis(makeLeads(2), 2) });
    await renderAdminPage();
    expect(screen.getByText(/Total na Waitlist/)).toBeInTheDocument();
    expect(screen.getByText(/Total na Waitlist:.*2/)).toBeInTheDocument();
  });

  it("exibe contagem de inscritos nos últimos 7 dias via recent_count", async () => {
    mockRpc.mockResolvedValue({ data: makeKpis(makeLeads(1), 1) });
    await renderAdminPage();
    expect(screen.getByText(/Últimos 7 dias/)).toBeInTheDocument();
  });

  it("exibe o produto de maior demanda", async () => {
    mockRpc.mockResolvedValue({
      data: makeKpis([
        ...makeLeads(2, { product_id: "devprint" }),
        ...makeLeads(1, { product_id: "ascend" }),
      ], 3),
    });
    await renderAdminPage();
    expect(screen.getByText(/Maior Demanda/)).toBeInTheDocument();
    expect(screen.getByText(/DevPrint/)).toBeInTheDocument();
  });

  it("exibe mensagem quando não há sugestões", async () => {
    mockAdminRpc.mockResolvedValue({ data: [] });
    await renderAdminPage();
    expect(screen.getByText("Nenhuma sugestão recebida ainda.")).toBeInTheDocument();
  });

  it("exibe sugestões recebidas quando há feedback", async () => {
    mockAdminRpc.mockResolvedValue({
      data: [makeFeedbackMeta({ mensagem: "Ótimo produto!" }, 0)],
    });
    await renderAdminPage();
    expect(screen.getByText("Ótimo produto!")).toBeInTheDocument();
    expect(screen.getByText("Sugestões Recebidas (1)")).toBeInTheDocument();
  });

  it("renderiza o AdminLanguageSwitcher", async () => {
    await renderAdminPage();
    expect(screen.getByTestId("admin-language-switcher")).toBeInTheDocument();
  });

  it("renderiza com data nula do RPC sem quebrar", async () => {
    mockRpc.mockResolvedValue({ data: null });
    mockAdminRpc.mockResolvedValue({ data: null });
    await renderAdminPage();
    expect(screen.getByText("Founder Dashboard")).toBeInTheDocument();
  });
});
