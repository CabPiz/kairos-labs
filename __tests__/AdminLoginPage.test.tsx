import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn().mockResolvedValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));

jest.mock("@/app/admin/login/_components/LoginForm", () => ({
  LoginForm: () => <form data-testid="login-form-mock" />,
}));

import LoginPage from "@/app/admin/login/page";

async function renderLoginPage() {
  const Component = await Promise.resolve(LoginPage());
  return render(Component as React.ReactElement);
}

describe("LoginPage", () => {
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
});
