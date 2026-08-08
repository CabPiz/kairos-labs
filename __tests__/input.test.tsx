import React from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renderiza o elemento input", () => {
    render(<Input placeholder="Digite aqui" />);
    expect(screen.getByPlaceholderText("Digite aqui")).toBeInTheDocument();
  });

  it("renderiza com data-slot=input", () => {
    const { container } = render(<Input />);
    expect(container.querySelector("[data-slot=input]")).toBeInTheDocument();
  });

  it("aceita type text", () => {
    render(<Input type="text" placeholder="texto" />);
    expect(screen.getByPlaceholderText("texto")).toHaveAttribute(
      "type",
      "text"
    );
  });

  it("aceita type email", () => {
    render(<Input type="email" placeholder="email" />);
    expect(screen.getByPlaceholderText("email")).toHaveAttribute(
      "type",
      "email"
    );
  });

  it("aceita className customizada", () => {
    const { container } = render(<Input className="meu-input" />);
    expect(container.querySelector(".meu-input")).toBeInTheDocument();
  });
});
