const mockSignOut = jest.fn().mockResolvedValue({});
const mockRedirect = jest.fn((url: URL) => ({ url: url.href, status: 302 }));

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn().mockResolvedValue({
    auth: { signOut: mockSignOut },
  }),
}));

jest.mock("next/server", () => ({
  NextResponse: { redirect: mockRedirect },
}));

import { GET } from "@/app/admin/logout/route";

describe("GET /admin/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  });

  it("chama supabase.auth.signOut()", async () => {
    await GET();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("redireciona para /admin/login", async () => {
    await GET();
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/admin/login" })
    );
  });

  it("usa NEXT_PUBLIC_SITE_URL quando definida", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://kairoslabs.com.br";
    await GET();
    const calledUrl: URL = mockRedirect.mock.calls[0][0];
    expect(calledUrl.origin).toBe("https://kairoslabs.com.br");
  });

  it("usa localhost como fallback quando NEXT_PUBLIC_SITE_URL não está definida", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    await GET();
    const calledUrl: URL = mockRedirect.mock.calls[0][0];
    expect(calledUrl.origin).toBe("http://localhost:3000");
  });
});
