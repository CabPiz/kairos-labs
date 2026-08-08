import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/waitlist/WaitlistModal", () => ({
  WaitlistModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="waitlist-modal" /> : null,
}));

import { WaitlistCTAButton } from "@/components/waitlist/WaitlistCTAButton";

const defaultProps = {
  productId: "devprint",
  productName: "DevPrint",
  productColor: "#4a90e2",
  ctaLabel: "Garantir Acesso",
};

describe("WaitlistCTAButton", () => {
  it("renderiza o botão com o ctaLabel", () => {
    render(<WaitlistCTAButton {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /garantir acesso/i })
    ).toBeInTheDocument();
  });

  it("modal começa fechado", () => {
    render(<WaitlistCTAButton {...defaultProps} />);
    expect(screen.queryByTestId("waitlist-modal")).not.toBeInTheDocument();
  });

  it("abre o modal ao clicar no botão", () => {
    render(<WaitlistCTAButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /garantir acesso/i }));
    expect(screen.getByTestId("waitlist-modal")).toBeInTheDocument();
  });

  it("aplica filter no mouseOver", () => {
    render(<WaitlistCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /garantir acesso/i });
    fireEvent.mouseOver(btn);
    expect(btn.style.filter).toBe("brightness(0.85)");
  });

  it("restaura filter no mouseOut", () => {
    render(<WaitlistCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /garantir acesso/i });
    fireEvent.mouseOver(btn);
    fireEvent.mouseOut(btn);
    expect(btn.style.filter).toBe("brightness(1)");
  });

  it("aplica filter no focus", () => {
    render(<WaitlistCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /garantir acesso/i });
    fireEvent.focus(btn);
    expect(btn.style.filter).toBe("brightness(0.85)");
  });

  it("restaura filter no blur", () => {
    render(<WaitlistCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /garantir acesso/i });
    fireEvent.focus(btn);
    fireEvent.blur(btn);
    expect(btn.style.filter).toBe("brightness(1)");
  });
});
