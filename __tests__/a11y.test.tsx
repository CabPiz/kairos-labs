import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { WaitlistModal } from "@/components/waitlist/WaitlistModal";
import { WaitlistCTAButton } from "@/components/waitlist/WaitlistCTAButton";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { FeedbackCTAButton } from "@/components/feedback/FeedbackCTAButton";
import * as waitlistAction from "@/components/waitlist/waitlist-action";

jest.mock("@/components/waitlist/waitlist-action", () => ({
  joinWaitlistAction: jest.fn(),
}));

const mockWaitlist = waitlistAction.joinWaitlistAction as jest.Mock;

const waitlistProps = {
  open: true,
  onOpenChange: jest.fn(),
  productId: "devprint",
  productName: "DevPrint",
  productColor: "#3b82f6",
};

const feedbackProps = {
  open: true,
  onOpenChange: jest.fn(),
  productId: "devprint",
  productName: "DevPrint",
  productColor: "#3b82f6",
};

// ─────────────────────────────────────────────────────────────
// WaitlistModal — axe
// ─────────────────────────────────────────────────────────────
describe("WaitlistModal — acessibilidade (axe)", () => {
  beforeEach(() => mockWaitlist.mockReset());

  it("não tem violações no estado idle", async () => {
    const { container } = render(<WaitlistModal {...waitlistProps} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("não tem violações no estado success", async () => {
    mockWaitlist.mockResolvedValueOnce({
      status: "success",
      email: "test@example.com",
    });
    const { container } = render(<WaitlistModal {...waitlistProps} />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "test@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /garantir acesso antecipado/i })
    );
    expect(await screen.findByText(/você está na lista/i)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("não tem violações no estado duplicate", async () => {
    mockWaitlist.mockResolvedValueOnce({ status: "duplicate" });
    const { container } = render(<WaitlistModal {...waitlistProps} />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "dup@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /garantir acesso antecipado/i })
    );
    expect(await screen.findByText(/já registrado/i)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("não tem violações no estado error", async () => {
    mockWaitlist.mockResolvedValueOnce({
      status: "error",
      message: "Erro interno.",
    });
    const { container } = render(<WaitlistModal {...waitlistProps} />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "ok@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /garantir acesso antecipado/i })
    );
    expect(await screen.findByText(/erro interno/i)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─────────────────────────────────────────────────────────────
// WaitlistModal — navegação por teclado
// ─────────────────────────────────────────────────────────────
describe("WaitlistModal — navegação por teclado", () => {
  it("campo de e-mail tem label associado, não está desabilitado e aceita foco direto", () => {
    render(<WaitlistModal {...waitlistProps} />);
    const input = screen.getByLabelText(/e-mail/i);
    expect(input).not.toBeDisabled();
    input.focus();
    expect(input).toHaveFocus();
  });

  it("botão de fechar está acessível por teclado com texto sr-only", () => {
    render(<WaitlistModal {...waitlistProps} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// FeedbackModal — axe
// ─────────────────────────────────────────────────────────────
describe("FeedbackModal — acessibilidade (axe)", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ status: "idle" }),
    });
  });

  it("não tem violações no estado idle", async () => {
    const { container } = render(<FeedbackModal {...feedbackProps} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("não tem violações no estado success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: "success" }),
    });
    const { container } = render(<FeedbackModal {...feedbackProps} />);
    await userEvent.type(
      screen.getByLabelText(/mensagem/i),
      "Uma sugestão bem detalhada aqui."
    );
    await userEvent.click(
      screen.getByRole("button", { name: /enviar sugestão/i })
    );
    expect(await screen.findByText(/sugestão enviada/i)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─────────────────────────────────────────────────────────────
// FeedbackModal — navegação por teclado
// ─────────────────────────────────────────────────────────────
describe("FeedbackModal — navegação por teclado", () => {
  it.each(["nome", "e-mail", "mensagem"])(
    "campo %s tem label associado, não está desabilitado e aceita foco direto",
    (labelText) => {
      render(<FeedbackModal {...feedbackProps} />);
      const field = screen.getByLabelText(new RegExp(labelText, "i"));
      expect(field).not.toBeDisabled();
      field.focus();
      expect(field).toHaveFocus();
    }
  );

  it("botão de fechar está acessível por teclado com texto sr-only", () => {
    render(<FeedbackModal {...feedbackProps} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// WaitlistCTAButton — axe e atributos
// ─────────────────────────────────────────────────────────────
describe("WaitlistCTAButton — acessibilidade", () => {
  it("não tem violações axe", async () => {
    const { container } = render(
      <WaitlistCTAButton
        productId="devprint"
        productName="DevPrint"
        productColor="#3b82f6"
        ctaLabel="Garantir Acesso"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("botão tem type=button", () => {
    render(
      <WaitlistCTAButton
        productId="devprint"
        productName="DevPrint"
        productColor="#3b82f6"
        ctaLabel="Garantir Acesso"
      />
    );
    expect(screen.getByRole("button", { name: /garantir acesso/i })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("aplica estilo de foco no focus e restaura no blur", async () => {
    render(
      <WaitlistCTAButton
        productId="devprint"
        productName="DevPrint"
        productColor="#3b82f6"
        ctaLabel="Garantir Acesso"
      />
    );
    const btn = screen.getByRole("button", { name: /garantir acesso/i });
    await userEvent.tab();
    expect(btn).toHaveFocus();
    expect(btn.style.filter).toBe("brightness(0.85)");
    await userEvent.tab();
    expect(btn.style.filter).toBe("brightness(1)");
  });
});

// ─────────────────────────────────────────────────────────────
// FeedbackCTAButton — axe e atributos
// ─────────────────────────────────────────────────────────────
describe("FeedbackCTAButton — acessibilidade", () => {
  it("não tem violações axe", async () => {
    const { container } = render(
      <FeedbackCTAButton
        productId="devprint"
        productName="DevPrint"
        productColor="#3b82f6"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("botão tem type=button", () => {
    render(
      <FeedbackCTAButton
        productId="devprint"
        productName="DevPrint"
        productColor="#3b82f6"
      />
    );
    expect(
      screen.getByRole("button", { name: /enviar sugestão/i })
    ).toHaveAttribute("type", "button");
  });
});
