import type { NextRequest } from "next/server";

const mockNextResponse = {
  cookies: { set: jest.fn() },
};

const mockNext = jest.fn(() => mockNextResponse);
const mockRedirect = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    next: (...args: unknown[]) => mockNext(...args),
    redirect: (...args: unknown[]) => mockRedirect(...args),
  },
}));

const mockGetUser = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

function makeRequest(
  pathname: string,
  { headerHas = () => false, method = "GET" }: { headerHas?: (name: string) => boolean; method?: string } = {}
): NextRequest {
  return {
    method,
    nextUrl: {
      pathname,
      clone() {
        const obj = { pathname } as { pathname: string };
        return obj;
      },
    },
    cookies: { getAll: () => [], get: () => undefined },
    headers: { get: () => null, has: headerHas },
  } as unknown as NextRequest;
}

describe("proxy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNext.mockReturnValue(mockNextResponse);
  });

  it("redireciona usuário não autenticado em /admin para /admin/login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { proxy } = await import("@/proxy");
    await proxy(makeRequest("/admin"));
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/admin/login" })
    );
  });

  it("redireciona usuário não autenticado em /admin/dashboard para /admin/login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { proxy } = await import("@/proxy");
    await proxy(makeRequest("/admin/dashboard"));
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/admin/login" })
    );
  });

  it("redireciona usuário autenticado em /admin/login para /admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { proxy } = await import("@/proxy");
    await proxy(makeRequest("/admin/login"));
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/admin" })
    );
  });

  it("permite acesso de usuário autenticado em /admin/dashboard (retorna supabaseResponse)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { proxy } = await import("@/proxy");
    const result = await proxy(makeRequest("/admin/dashboard"));
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBe(mockNextResponse);
  });

  it("detecta locale via cookie NEXT_LOCALE para rotas admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { proxy } = await import("@/proxy");
    const req = {
      ...makeRequest("/admin/dashboard"),
      cookies: { getAll: () => [], get: (name: string) => name === "NEXT_LOCALE" ? { value: "en" } : undefined },
      headers: { get: () => null },
    } as unknown as import("next/server").NextRequest;
    await proxy(req);
    // Deve usar locale "en" sem redirecionar
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("detecta locale via Accept-Language quando cookie ausente", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { proxy } = await import("@/proxy");
    const req = {
      ...makeRequest("/admin/dashboard"),
      cookies: { getAll: () => [], get: () => undefined },
      headers: { get: (name: string) => name === "accept-language" ? "es-419,es;q=0.9" : null },
    } as unknown as import("next/server").NextRequest;
    await proxy(req);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("não redireciona Server Action (Next-Action header) mesmo sem sessão", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { proxy } = await import("@/proxy");
    const req = makeRequest("/admin/contacts", {
      method: "POST",
      headerHas: (name) => name === "next-action",
    });
    const result = await proxy(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBe(mockNextResponse);
  });

  it("exporta config com matcher cobrindo rotas de app (admin + locale), excluindo api/_next/assets", async () => {
    const { config } = await import("@/proxy");
    // O matcher do proxy unificou intl + admin em uma única regex desde a issue #88
    // (next-intl exige matcher genérico para cobrir /[locale]/... e /admin/...)
    expect(Array.isArray(config.matcher)).toBe(true);
    const pattern: string = config.matcher[0];
    expect(pattern).toContain("api");     // exclui rotas /api
    expect(pattern).toContain("_next");   // exclui assets do Next.js
  });
});
