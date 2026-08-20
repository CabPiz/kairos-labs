import { getAnalysisEstimate } from "@/app/admin/contacts/actions";
import { createServerAdminClient } from "@/lib/supabase-server";

jest.mock("@/lib/supabase-server");
jest.mock("@/inngest/client", () => ({ inngest: { send: jest.fn() } }));
jest.mock("@/lib/ai/pipeline-logger", () => ({ logPipelineEvent: jest.fn() }));
jest.mock("server-only", () => ({}));

type SupabaseBuilder = {
  select: () => SupabaseBuilder;
  eq: () => SupabaseBuilder;
  not: () => SupabaseBuilder;
  order: () => SupabaseBuilder;
  limit: () => SupabaseBuilder;
  then: <T>(resolve: (v: { data: unknown; error: null }) => T) => Promise<T>;
};

function makeQuery(data: unknown): SupabaseBuilder {
  const result = { data, error: null };
  const builder: SupabaseBuilder = {
    select: () => builder,
    eq: () => builder,
    not: () => builder,
    order: () => builder,
    limit: () => builder,
    then: <T>(resolve: (v: typeof result) => T) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

describe("getAnalysisEstimate", () => {
  const mockFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerAdminClient as jest.Mock).mockReturnValue({ from: mockFrom });
  });

  it("usa fórmula baseada em tamanho quando não há histórico de agent_runs", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "contact_attachments") return makeQuery([{ size_bytes: 10 * 1024 * 1024 }]);
      return makeQuery([]);
    });

    const result = await getAnalysisEstimate("contact-uuid");

    // totalMb = 10 → expected = min(180, max(30, 30 + 10*10)) = min(180, 130) = 130
    expect(result.expected).toBe(130);
    expect(result.max).toBe(Math.max(120, Math.round(130 * 2.5)));
  });

  it("usa mediana de latência ajustada por tamanho relativo quando há histórico", async () => {
    const fiveMb = 5 * 1024 * 1024;
    mockFrom.mockImplementation((table: string) => {
      if (table === "contact_attachments") return makeQuery([{ size_bytes: fiveMb }]);
      return makeQuery([
        { latency_ms: 60_000, metadata: { total_size_bytes: fiveMb } },
        { latency_ms: 40_000, metadata: { total_size_bytes: fiveMb } },
      ]);
    });

    const result = await getAnalysisEstimate("contact-uuid");

    // latency mediana = (40000+60000)/2 = 50000ms = 50s
    // refMb = 5, totalMb = 5 → ajuste = 0 → expected = 50
    expect(result.expected).toBe(50);
    expect(result.max).toBe(Math.max(120, Math.round(50 * 2.5)));
  });
});
