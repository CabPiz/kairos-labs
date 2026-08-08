const mockCreateServerClient = jest.fn(() => ({ _type: "server-client" }));
const mockCreateClient = jest.fn(() => ({ _type: "admin-client" }));
const mockGetAll = jest.fn(() => []);
const mockSet = jest.fn();
const mockCookies = jest.fn().mockResolvedValue({ getAll: mockGetAll, set: mockSet });

jest.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: mockCreateClient,
}));

jest.mock("next/headers", () => ({
  cookies: mockCookies,
}));

import {
  createServerAdminClient,
  createServerSupabaseClient,
} from "@/lib/supabase-server";

describe("lib/supabase-server", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  describe("createServerAdminClient", () => {
    it("chama createClient do supabase-js com URL e service role key", () => {
      createServerAdminClient();
      expect(mockCreateClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "service-role-key",
        expect.objectContaining({ auth: expect.any(Object) })
      );
    });

    it("retorna o cliente criado", () => {
      const client = createServerAdminClient();
      expect(client).toEqual({ _type: "admin-client" });
    });
  });

  describe("createServerSupabaseClient", () => {
    it("chama cookies() para obter o cookie store", async () => {
      await createServerSupabaseClient();
      expect(mockCookies).toHaveBeenCalled();
    });

    it("chama createServerClient com URL e anon key", async () => {
      await createServerSupabaseClient();
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "anon-key",
        expect.objectContaining({ cookies: expect.any(Object) })
      );
    });

    it("retorna o cliente criado", async () => {
      const client = await createServerSupabaseClient();
      expect(client).toEqual({ _type: "server-client" });
    });

    it("getAll delega para cookieStore.getAll", async () => {
      await createServerSupabaseClient();
      const cookiesArg = mockCreateServerClient.mock.calls[0][2];
      cookiesArg.cookies.getAll();
      expect(mockGetAll).toHaveBeenCalled();
    });

    it("setAll não lança quando cookieStore.set disponível", async () => {
      await createServerSupabaseClient();
      const cookiesArg = mockCreateServerClient.mock.calls[0][2];
      expect(() =>
        cookiesArg.cookies.setAll([
          { name: "sb-token", value: "abc", options: {} },
        ])
      ).not.toThrow();
    });

    it("setAll captura exceção silenciosamente (Server Component)", async () => {
      mockSet.mockImplementationOnce(() => {
        throw new Error("read-only");
      });
      await createServerSupabaseClient();
      const cookiesArg = mockCreateServerClient.mock.calls[0][2];
      expect(() =>
        cookiesArg.cookies.setAll([
          { name: "sb-token", value: "abc", options: {} },
        ])
      ).not.toThrow();
    });
  });
});
