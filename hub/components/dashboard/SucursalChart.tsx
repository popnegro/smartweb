"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { SucursalKpi } from "@/lib/types";

export function SucursalChart({ data }: { data: SucursalKpi[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="sucursal"
          tick={{ fontSize: 12, fill: "#0F172A" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E0", fontSize: 13 }}
        />
        <Bar dataKey="nps" radius={[0, 6, 6, 0]} barSize={14} name="NPS">
          {data.map((d, i) => (
            <Cell key={d.sucursal} fill={i === 0 ? "#1E3A8A" : "#93A4D6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
