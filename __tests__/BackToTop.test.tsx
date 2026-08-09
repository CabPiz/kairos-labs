import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BackToTop } from "@/components/sections/BackToTop";

describe("BackToTop", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 0 });
    window.scrollTo = jest.fn();
  });

  it("não renderiza o botão abaixo de 300px de scroll", () => {
    render(<BackToTop />);
    expect(screen.queryByRole("button", { name: /voltar ao topo/i })).not.toBeInTheDocument();
  });

  it("renderiza o botão após scroll acima de 300px", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 350 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("button", { name: /voltar ao topo/i })).toBeInTheDocument();
  });

  it("chama scrollTo com top:0 e behavior:smooth ao clicar", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 400 });
      fireEvent.scroll(window);
    });
    fireEvent.click(screen.getByRole("button", { name: /voltar ao topo/i }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("altera estilo no mouseOver e restaura no mouseOut", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 400 });
      fireEvent.scroll(window);
    });
    const btn = screen.getByRole("button", { name: /voltar ao topo/i });
    fireEvent.mouseOver(btn);
    expect(btn.style.borderColor).toBe("rgba(74,144,226,0.7)");
    fireEvent.mouseOut(btn);
    expect(btn.style.borderColor).toBe("rgba(59,130,246,0.35)");
  });

  it("altera estilo no focus e restaura no blur", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 400 });
      fireEvent.scroll(window);
    });
    const btn = screen.getByRole("button", { name: /voltar ao topo/i });
    fireEvent.focus(btn);
    expect(btn.style.borderColor).toBe("rgba(74,144,226,0.7)");
    fireEvent.blur(btn);
    expect(btn.style.borderColor).toBe("rgba(59,130,246,0.35)");
  });

  it("oculta o botão quando scroll volta abaixo de 300px", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 400 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("button", { name: /voltar ao topo/i })).toBeInTheDocument();
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 100 });
      fireEvent.scroll(window);
    });
    expect(screen.queryByRole("button", { name: /voltar ao topo/i })).not.toBeInTheDocument();
  });
});
