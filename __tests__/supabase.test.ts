const mockCreateBrowserClient = jest.fn(() => ({ _type: "browser-client" }));

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: mockCreateBrowserClient,
}));

import { createClient, createAdminClient } from "@/lib/supabase";

describe("lib/supabase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  describe("createClient", () => {
    it("chama createBrowserClient com URL e anon key", () => {
      createClient();
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "anon-key"
      );
    });

    it("retorna o cliente criado", () => {
      const client = createClient();
      expect(client).toEqual({ _type: "browser-client" });
    });
  });

  describe("createAdminClient", () => {
    it("chama createBrowserClient com URL e service role key", () => {
      createAdminClient();
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "service-role-key"
      );
    });

    it("retorna o cliente criado", () => {
      const client = createAdminClient();
      expect(client).toEqual({ _type: "browser-client" });
    });
  });
});
