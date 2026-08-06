import React from "react";
import { render, screen } from "@testing-library/react";
import { KPICard } from "@/components/admin/KPICard";

describe("KPICard", () => {
  it("renderiza o label e o valor", () => {
    render(<KPICard label="Total na Waitlist" value={42} />);
    expect(screen.getByText("Total na Waitlist")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renderiza o sublabel quando fornecido", () => {
    render(<KPICard label="Últimos 7 dias" value={5} sublabel="novos inscritos" />);
    expect(screen.getByText("novos inscritos")).toBeInTheDocument();
  });

  it("não renderiza sublabel quando omitido", () => {
    render(<KPICard label="KPI" value={0} />);
    expect(screen.queryByText("novos inscritos")).not.toBeInTheDocument();
  });

  it("aceita valor do tipo string", () => {
    render(<KPICard label="Maior Demanda" value="DevPrint" />);
    expect(screen.getByText("DevPrint")).toBeInTheDocument();
  });

  it.each([
    { highlight: true, label: "com destaque" },
    { highlight: false, label: "sem destaque" },
    { highlight: undefined, label: "destaque padrão (false)" },
  ])("renderiza corretamente $label", ({ highlight }) => {
    render(<KPICard label="KPI" value={10} highlight={highlight} />);
    expect(screen.getByText("KPI")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
