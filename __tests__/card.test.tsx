import React from "react";
import { render } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card components", () => {
  it("Card renderiza com data-slot=card", () => {
    const { container } = render(<Card>conteúdo</Card>);
    expect(container.querySelector("[data-slot=card]")).toBeInTheDocument();
  });

  it("Card renderiza com size=sm", () => {
    const { container } = render(<Card size="sm">conteúdo</Card>);
    expect(container.querySelector("[data-size=sm]")).toBeInTheDocument();
  });

  it("CardHeader renderiza com data-slot=card-header", () => {
    const { container } = render(<CardHeader>header</CardHeader>);
    expect(
      container.querySelector("[data-slot=card-header]")
    ).toBeInTheDocument();
  });

  it("CardTitle renderiza com data-slot=card-title", () => {
    const { container } = render(<CardTitle>título</CardTitle>);
    expect(
      container.querySelector("[data-slot=card-title]")
    ).toBeInTheDocument();
  });

  it("CardDescription renderiza com data-slot=card-description", () => {
    const { container } = render(
      <CardDescription>descrição</CardDescription>
    );
    expect(
      container.querySelector("[data-slot=card-description]")
    ).toBeInTheDocument();
  });

  it("CardAction renderiza com data-slot=card-action", () => {
    const { container } = render(<CardAction>ação</CardAction>);
    expect(
      container.querySelector("[data-slot=card-action]")
    ).toBeInTheDocument();
  });

  it("CardContent renderiza com data-slot=card-content", () => {
    const { container } = render(<CardContent>body</CardContent>);
    expect(
      container.querySelector("[data-slot=card-content]")
    ).toBeInTheDocument();
  });

  it("CardFooter renderiza com data-slot=card-footer", () => {
    const { container } = render(<CardFooter>rodapé</CardFooter>);
    expect(
      container.querySelector("[data-slot=card-footer]")
    ).toBeInTheDocument();
  });

  it("Card aceita className customizada", () => {
    const { container } = render(
      <Card className="minha-classe">conteúdo</Card>
    );
    expect(container.querySelector(".minha-classe")).toBeInTheDocument();
  });
});
