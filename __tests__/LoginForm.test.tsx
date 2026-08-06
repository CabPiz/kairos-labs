import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/admin/login/_components/LoginForm";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockSignIn = jest.fn();

jest.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  }),
}));

function renderForm() {
  return render(<LoginForm />);
}

describe("LoginForm", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
  });

  describe("renderização inicial", () => {
    it("exibe o campo de e-mail", () => {
      renderForm();
      expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    });

    it("exibe o campo de senha", () => {
      renderForm();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    });

    it("exibe o botão de submit com texto Entrar", () => {
      renderForm();
      expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    });

    it("não exibe mensagem de erro inicialmente", () => {
      renderForm();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("interação do usuário", () => {
    it("atualiza o campo de e-mail ao digitar", async () => {
      renderForm();
      const input = screen.getByLabelText("E-mail");
      await userEvent.type(input, "founder@kairos.com");
      expect(input).toHaveValue("founder@kairos.com");
    });

    it("atualiza o campo de senha ao digitar", async () => {
      renderForm();
      const input = screen.getByLabelText("Senha");
      await userEvent.type(input, "senhaSecreta");
      expect(input).toHaveValue("senhaSecreta");
    });
  });

  describe("submit com sucesso", () => {
    it("chama signInWithPassword com os dados preenchidos", async () => {
      mockSignIn.mockResolvedValue({ error: null });
      renderForm();

      await userEvent.type(screen.getByLabelText("E-mail"), "founder@kairos.com");
      await userEvent.type(screen.getByLabelText("Senha"), "senhaSecreta");
      fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: "founder@kairos.com",
          password: "senhaSecreta",
        });
      });
    });

    it("redireciona para /admin após login bem-sucedido", async () => {
      mockSignIn.mockResolvedValue({ error: null });
      renderForm();

      await userEvent.type(screen.getByLabelText("E-mail"), "founder@kairos.com");
      await userEvent.type(screen.getByLabelText("Senha"), "senhaSecreta");
      fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/admin");
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe("submit com erro", () => {
    it("exibe mensagem de erro quando credenciais são inválidas", async () => {
      mockSignIn.mockResolvedValue({ error: { message: "Invalid login credentials" } });
      renderForm();

      await userEvent.type(screen.getByLabelText("E-mail"), "errado@kairos.com");
      await userEvent.type(screen.getByLabelText("Senha"), "senhaErrada");
      fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Credenciais inválidas. Verifique e-mail e senha."
        );
      });
    });

    it("não redireciona quando há erro de autenticação", async () => {
      mockSignIn.mockResolvedValue({ error: { message: "Invalid login credentials" } });
      renderForm();

      await userEvent.type(screen.getByLabelText("E-mail"), "errado@kairos.com");
      await userEvent.type(screen.getByLabelText("Senha"), "senhaErrada");
      fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("reabilita o botão após erro de autenticação", async () => {
      mockSignIn.mockResolvedValue({ error: { message: "Invalid login credentials" } });
      renderForm();

      await userEvent.type(screen.getByLabelText("E-mail"), "errado@kairos.com");
      await userEvent.type(screen.getByLabelText("Senha"), "senhaErrada");
      fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Entrar" })).not.toBeDisabled();
      });
    });
  });

  describe("estado de loading", () => {
    it("desabilita o botão durante o submit", async () => {
      mockSignIn.mockReturnValue(new Promise(() => {}));
      renderForm();

      await userEvent.type(screen.getByLabelText("E-mail"), "founder@kairos.com");
      await userEvent.type(screen.getByLabelText("Senha"), "senhaSecreta");
      fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Entrando…" })).toBeDisabled();
      });
    });
  });
});
