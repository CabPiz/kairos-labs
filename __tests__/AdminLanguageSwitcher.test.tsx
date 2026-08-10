import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

jest.mock("@/lib/admin/set-locale-action", () => ({
  setAdminLocaleAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import { setAdminLocaleAction } from "@/lib/admin/set-locale-action";

describe("AdminLanguageSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza os três botões de idioma", () => {
    render(<AdminLanguageSwitcher />);
    expect(screen.getByRole("button", { name: "Português" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument();
  });

  it("marca o locale atual (pt) como ativo com aria-current", () => {
    render(<AdminLanguageSwitcher />);
    expect(screen.getByRole("button", { name: "Português" })).toHaveAttribute("aria-current", "true");
  });

  it.each(["English", "Español"] as const)(
    "botão '%s' não tem aria-current quando locale ativo é pt",
    (label) => {
      render(<AdminLanguageSwitcher />);
      expect(screen.getByRole("button", { name: label })).not.toHaveAttribute("aria-current");
    }
  );

  it("chama setAdminLocaleAction com locale e pathname ao clicar em outro idioma", async () => {
    render(<AdminLanguageSwitcher />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "English" }));
    });
    expect(setAdminLocaleAction).toHaveBeenCalledWith("en", "/admin");
  });

  it("chama setAdminLocaleAction com 'es' ao clicar em Español", async () => {
    render(<AdminLanguageSwitcher />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Español" }));
    });
    expect(setAdminLocaleAction).toHaveBeenCalledWith("es", "/admin");
  });

  it("não chama setAdminLocaleAction ao clicar no locale já ativo", async () => {
    render(<AdminLanguageSwitcher />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Português" }));
    });
    expect(setAdminLocaleAction).not.toHaveBeenCalled();
  });
});
