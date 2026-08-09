import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/admin/login/_components/LoginForm", () => ({
  LoginForm: () => <form data-testid="login-form-mock" />,
}));

async function renderLoginPage() {
  const LoginPage = (await import("@/app/admin/login/page")).default;
  render(await LoginPage());
}

describe("LoginPage", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("renderiza o elemento main", async () => {
    await renderLoginPage();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("exibe o título Kairos Labs", async () => {
    await renderLoginPage();
    expect(screen.getByRole("heading", { name: /kairos labs/i })).toBeInTheDocument();
  });

  it("exibe o texto de acesso restrito", async () => {
    await renderLoginPage();
    expect(screen.getByText(/acesso restrito/i)).toBeInTheDocument();
  });

  it("renderiza o LoginForm", async () => {
    await renderLoginPage();
    expect(screen.getByTestId("login-form-mock")).toBeInTheDocument();
  });

  it("exibe link para voltar ao site principal", async () => {
    await renderLoginPage();
    const backLink = screen.getByRole("link", { name: /voltar ao site/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });
});
