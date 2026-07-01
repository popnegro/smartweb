"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TrendPoint } from "@/lib/types";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E0" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #E7E5E0",
            fontSize: 13,
          }}
        />
        <Line type="monotone" dataKey="nps" stroke="#1E3A8A" strokeWidth={2.5} dot={false} name="NPS" />
        <Line type="monotone" dataKey="csat" stroke="#0EA5E9" strokeWidth={2.5} dot={false} name="CSAT" />
      </LineChart>
    </ResponsiveContainer>
  );
}
