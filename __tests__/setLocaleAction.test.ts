jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { setAdminLocaleAction } from "@/lib/admin/set-locale-action";

const mockCookieSet = jest.fn();

describe("setAdminLocaleAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue({ set: mockCookieSet });
  });

  it.each(["pt", "en", "es"] as const)(
    "define o cookie NEXT_LOCALE para o locale válido '%s'",
    async (locale) => {
      await setAdminLocaleAction(locale, "/admin").catch(() => {});
      expect(mockCookieSet).toHaveBeenCalledWith("NEXT_LOCALE", locale, expect.any(Object));
    }
  );

  it("não define cookie para locale inválido", async () => {
    await setAdminLocaleAction("fr", "/admin");
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it("não redireciona para locale inválido", async () => {
    await setAdminLocaleAction("zh", "/admin");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redireciona para o pathname fornecido após definir o cookie", async () => {
    await setAdminLocaleAction("en", "/admin/login").catch(() => {});
    expect(redirect).toHaveBeenCalledWith("/admin/login");
  });

  it("define o cookie com maxAge de 1 ano", async () => {
    await setAdminLocaleAction("es", "/admin").catch(() => {});
    expect(mockCookieSet).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "es",
      expect.objectContaining({ maxAge: 60 * 60 * 24 * 365 })
    );
  });
});
