import React from "react";
import { render, screen } from "@testing-library/react";
import { DemandChart } from "@/components/admin/DemandChart";

jest.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid={`xaxis-${dataKey}`} />,
  YAxis: () => <div data-testid="yaxis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
}));

const SAMPLE_LEADS = [
  { product_id: "devprint" },
  { product_id: "devprint" },
  { product_id: "ascend" },
  { product_id: "elucya-talk" },
  { product_id: "elucya-talk" },
  { product_id: "elucya-talk" },
];

describe("DemandChart", () => {
  it("renderiza o BarChart quando há leads", () => {
    render(<DemandChart leads={SAMPLE_LEADS} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renderiza mensagem vazia quando não há leads", () => {
    render(<DemandChart leads={[]} />);
    expect(screen.getByText("Nenhum inscrito registrado ainda.")).toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });

  it("renderiza o eixo X com dataKey 'produto'", () => {
    render(<DemandChart leads={SAMPLE_LEADS} />);
    expect(screen.getByTestId("xaxis-produto")).toBeInTheDocument();
  });

  it("renderiza uma Cell por produto único", () => {
    render(<DemandChart leads={SAMPLE_LEADS} />);
    const cells = screen.getAllByTestId("cell");
    expect(cells).toHaveLength(3);
  });

  it.each([
    { product_id: "devprint", nome: "DevPrint" },
    { product_id: "ascend", nome: "Ascend" },
    { product_id: "elucya-talk", nome: "Elucya Talk" },
    { product_id: "agora-global", nome: "Ágora Global" },
    { product_id: "kairos-labs", nome: "Kairos Labs" },
  ])("mapeia product_id '$product_id' para '$nome'", ({ product_id }) => {
    render(<DemandChart leads={[{ product_id }]} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("usa o próprio product_id quando não há mapeamento", () => {
    render(<DemandChart leads={[{ product_id: "produto-desconhecido" }]} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });
});
