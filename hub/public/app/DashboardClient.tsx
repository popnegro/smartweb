"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import type { TrendPoint, SucursalKpi } from "@/lib/types";

// Dynamically import heavy components
const TrendChart = dynamic(() => import("@/components/dashboard/TrendChart").then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full animate-pulse rounded-lg bg-canvas" />,
});
const SucursalChart = dynamic(() => import("@/components/dashboard/SucursalChart").then((mod) => mod.SucursalChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full animate-pulse rounded-lg bg-canvas" />,
});

interface DashboardClientProps {
  trendData: TrendPoint[];
  sucursalKpis: SucursalKpi[];
}

export function DashboardClient({ trendData, sucursalKpis }: DashboardClientProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Tendencia NPS / CSAT</p>
            <p className="text-xs text-muted">Últimos 6 meses</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full bg-lorenzo" />NPS</span>
            <span className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full bg-signal-info" />CSAT</span>
          </div>
        </div>
        <TrendChart data={trendData} />
      </Card>
      <Card className="p-5">
        <p className="text-sm font-semibold text-ink">Ranking de sucursales</p>
        <p className="mb-4 text-xs text-muted">Por NPS</p>
        <SucursalChart data={sucursalKpis} />
      </Card>
    </div>
  );
}