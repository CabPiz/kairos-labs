import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/feedback/FeedbackModal", () => ({
  FeedbackModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="feedback-modal" /> : null,
}));

import { FeedbackCTAButton } from "@/components/feedback/FeedbackCTAButton";

const defaultProps = {
  productId: "devprint",
  productName: "DevPrint",
  productColor: "#4a90e2",
};

describe("FeedbackCTAButton", () => {
  it("renderiza o botão Enviar Sugestão", () => {
    render(<FeedbackCTAButton {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /enviar sugestão/i })
    ).toBeInTheDocument();
  });

  it("modal começa fechado", () => {
    render(<FeedbackCTAButton {...defaultProps} />);
    expect(screen.queryByTestId("feedback-modal")).not.toBeInTheDocument();
  });

  it("abre o modal ao clicar no botão", () => {
    render(<FeedbackCTAButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /enviar sugestão/i }));
    expect(screen.getByTestId("feedback-modal")).toBeInTheDocument();
  });

  it("altera estilo do botão no mouseOver", () => {
    render(<FeedbackCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /enviar sugestão/i });
    fireEvent.mouseOver(btn);
    expect(btn.style.borderColor).toBe("#4a90e2");
  });

  it("restaura estilo do botão no mouseOut", () => {
    render(<FeedbackCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /enviar sugestão/i });
    fireEvent.mouseOver(btn);
    fireEvent.mouseOut(btn);
    expect(btn.style.background).toBe("transparent");
  });

  it("altera estilo do botão no focus", () => {
    render(<FeedbackCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /enviar sugestão/i });
    fireEvent.focus(btn);
    expect(btn.style.borderColor).toBe("#4a90e2");
  });

  it("restaura estilo do botão no blur", () => {
    render(<FeedbackCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /enviar sugestão/i });
    fireEvent.focus(btn);
    fireEvent.blur(btn);
    expect(btn.style.background).toBe("transparent");
  });
});
