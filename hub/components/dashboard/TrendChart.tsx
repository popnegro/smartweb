"use client";

import type { TrendPoint } from "@/lib/types";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--lorenzo))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--lorenzo))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCsat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--signal-info))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--signal-info))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--canvas-secondary))",
            borderColor: "hsl(var(--line))",
          }}
        />
        <Area type="monotone" dataKey="nps" stroke="hsl(var(--lorenzo))" fill="url(#colorNps)" />
        <Area type="monotone" dataKey="csat" stroke="hsl(var(--signal-info))" fill="url(#colorCsat)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}