"use client";

import type { SucursalKpi } from "@/lib/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function SucursalChart({ data }: { data: SucursalKpi[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="sucursal"
          stroke="#525252"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="nps" fill="hsl(var(--lorenzo))" radius={[0, 4, 4, 0]} background={{ fill: "#eee" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}