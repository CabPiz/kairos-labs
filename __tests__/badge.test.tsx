import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renderiza o texto do badge", () => {
    render(<Badge>Em breve</Badge>);
    expect(screen.getByText("Em breve")).toBeInTheDocument();
  });

  it("renderiza como span por padrão", () => {
    const { container } = render(<Badge>texto</Badge>);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("aceita className customizada", () => {
    const { container } = render(
      <Badge className="meu-badge">texto</Badge>
    );
    expect(container.querySelector(".meu-badge")).toBeInTheDocument();
  });

  it.each([
    "default",
    "secondary",
    "destructive",
    "outline",
    "ghost",
    "link",
  ] as const)("renderiza com variante %s sem erros", (variant) => {
    expect(() =>
      render(<Badge variant={variant}>badge</Badge>)
    ).not.toThrow();
  });
});
