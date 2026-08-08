import React from "react";
import { render, screen } from "@testing-library/react";
import { FeatureCards } from "@/components/sections/FeatureCards";

describe("FeatureCards", () => {
  it("renderiza os 4 cards de feature", () => {
    render(<FeatureCards />);
    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Segurança")).toBeInTheDocument();
    expect(screen.getByText("Escalabilidade")).toBeInTheDocument();
    expect(screen.getByText("Inovação")).toBeInTheDocument();
  });

  it("renderiza a descrição de cada feature", () => {
    render(<FeatureCards />);
    expect(
      screen.getByText(/Arquitetura escalável/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/RLS, criptografia/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Infraestrutura pronta/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/IA, automação/i)
    ).toBeInTheDocument();
  });
});
