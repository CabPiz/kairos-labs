import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/admin/login/_components/LoginForm", () => ({
  LoginForm: () => <form data-testid="login-form-mock" />,
}));

import LoginPage from "@/app/admin/login/page";

describe("LoginPage", () => {
  it("renderiza o elemento main", () => {
    render(<LoginPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("exibe o título Kairos Labs", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /kairos labs/i })).toBeInTheDocument();
  });

  it("exibe o texto de acesso restrito", () => {
    render(<LoginPage />);
    expect(screen.getByText(/acesso restrito/i)).toBeInTheDocument();
  });

  it("renderiza o LoginForm", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("login-form-mock")).toBeInTheDocument();
  });

  it("exibe link para voltar ao site principal", () => {
    render(<LoginPage />);
    const backLink = screen.getByRole("link", { name: /voltar ao site/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });
});
