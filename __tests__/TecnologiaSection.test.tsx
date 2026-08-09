import React from "react";
import { render, screen } from "@testing-library/react";
import { TecnologiaSection } from "@/components/sections/TecnologiaSection";

describe("TecnologiaSection", () => {
  it("renderiza com id='tecnologia' para navegação por âncora", () => {
    render(<TecnologiaSection />);
    expect(document.getElementById("tecnologia")).toBeInTheDocument();
  });

  it("exibe o título da seção", () => {
    render(<TecnologiaSection />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it.each(["Next.js 15", "TypeScript", "Supabase", "Tailwind CSS", "Playwright", "SonarCloud"])(
    "exibe a tecnologia %s",
    (tech) => {
      render(<TecnologiaSection />);
      expect(screen.getByText(tech)).toBeInTheDocument();
    }
  );

  it("exibe a descrição de cada tecnologia", () => {
    render(<TecnologiaSection />);
    expect(screen.getByText(/App Router/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipagem estrita/i)).toBeInTheDocument();
  });
});
