"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { productNames as PRODUCT_NAMES } from "@/lib/products";

const BAR_COLORS = ["#3b82f6", "#d4a017", "#6366f1", "#10b981", "#f59e0b"];

interface DemandChartProps {
  readonly leads: { product_id: string }[];
}

interface ChartEntry {
  produto: string;
  inscritos: number;
}

function aggregateByProduct(leads: { product_id: string }[]): ChartEntry[] {
  const counts: Record<string, number> = {};
  for (const row of leads) {
    counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([id, inscritos]) => ({
      produto: PRODUCT_NAMES[id] ?? id,
      inscritos,
    }))
    .sort((a, b) => b.inscritos - a.inscritos);
}

export function DemandChart({ leads }: DemandChartProps) {
  const data = aggregateByProduct(leads);

  if (data.length === 0) {
    return (
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem" }}>
        Nenhum inscrito registrado ainda.
      </p>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(59,130,246,0.14)",
        borderRadius: "12px",
        padding: "1.5rem",
        maxWidth: "860px",
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <XAxis
            dataKey="produto"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#0a1525",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.82rem",
            }}
            formatter={(value) => [value, "Inscritos"]}
          />
          <Bar dataKey="inscritos" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.produto}
                fill={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
