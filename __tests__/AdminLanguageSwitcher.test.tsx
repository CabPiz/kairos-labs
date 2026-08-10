import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

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

  it("renderiza o botão de toggle do dropdown", () => {
    render(<AdminLanguageSwitcher />);
    expect(screen.getByRole("button", { name: "Idioma" })).toBeInTheDocument();
  });

  it("dropdown está fechado inicialmente — opções não visíveis", () => {
    render(<AdminLanguageSwitcher />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("abre o dropdown ao clicar no botão de toggle", () => {
    render(<AdminLanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Português/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Español/ })).toBeInTheDocument();
  });

  it("marca o locale atual (pt) com aria-current no menu", () => {
    render(<AdminLanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
    expect(screen.getByRole("menuitem", { name: /Português/ })).toHaveAttribute("aria-current", "true");
  });

  it.each(["English", "Español"] as const)(
    "opção '%s' não tem aria-current quando locale ativo é pt",
    (label) => {
      render(<AdminLanguageSwitcher />);
      fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
      expect(screen.getByRole("menuitem", { name: new RegExp(label) })).not.toHaveAttribute("aria-current");
    }
  );

  it("chama setAdminLocaleAction com locale e pathname ao selecionar outro idioma", () => {
    render(<AdminLanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /English/ }));
    expect(setAdminLocaleAction).toHaveBeenCalledWith("en", "/admin");
  });

  it("chama setAdminLocaleAction com 'es' ao selecionar Español", () => {
    render(<AdminLanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Español/ }));
    expect(setAdminLocaleAction).toHaveBeenCalledWith("es", "/admin");
  });

  it("não chama setAdminLocaleAction ao clicar no locale já ativo", () => {
    render(<AdminLanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Português/ }));
    expect(setAdminLocaleAction).not.toHaveBeenCalled();
  });

  it("fecha o dropdown após selecionar um idioma diferente", () => {
    render(<AdminLanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /English/ }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
