import { Topbar } from "@/components/layout/Topbar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card } from "@/components/ui/Card";
import { Badge, riesgoTone, prioridadTone } from "@/components/ui/Badge";
import { getReclamos, SUCURSAL_KPIS, TREND, getDashboardKpis } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Gauge, MessageSquareWarning, Clock3, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Reclamo } from "@/lib/types";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const kpis = getDashboardKpis();
  const reclamos = await getReclamos();
  const criticos = reclamos.filter((r) => r.riesgo === "Crítico" && r.estado !== "Resuelto").slice(0, 5);

  return (
    <>
      <Topbar
        title="Executive Dashboard"
        subtitle="Visión general de la performance y estado de la operación."
      />
      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="NPS" value={String(kpis.nps)} delta="+2.5" deltaTone="positive" icon={Gauge} />
          <KpiCard label="CSAT" value={`${kpis.csat}%`} delta="+1.2" deltaTone="positive" icon={Gauge} />
          <KpiCard label="Reclamos Abiertos" value={String(kpis.reclamosAbiertos)} delta="-3" deltaTone="positive" icon={MessageSquareWarning} />
          <KpiCard label="Clientes Críticos" value={String(kpis.clientesCriticos)} delta="+1" deltaTone="critical" icon={AlertTriangle} />
          <KpiCard label="Tpo. Prom. Res." value={`${kpis.tiempoPromedioHoras}hs`} delta="-8%" deltaTone="positive" icon={Clock3} />
          <KpiCard label="Total Reclamos" value={String(kpis.totalReclamos)} delta="+10" deltaTone="neutral" icon={MessageSquareWarning} />
        </div>

        <DashboardClient trendData={TREND} sucursalKpis={SUCURSAL_KPIS} />

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Clientes Críticos</p>
              <p className="text-xs text-muted">Reclamos abiertos con riesgo crítico.</p>
            </div>
            <Link href="/reclamos" className="text-xs font-medium text-lorenzo hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="flow-root">
            <div className="-my-2 divide-y divide-line">
              {criticos.map((r: Reclamo) => (
                <Link key={r.id} href={`/reclamos/${r.id}`} className="flex items-center gap-4 py-3 hover:bg-canvas">
                  <div className="w-40">
                    <p className="truncate text-xs font-medium text-ink">{r.cliente}</p>
                    <p className="truncate text-xs text-muted">{r.sucursal}</p>
                  </div>
                  <p className="flex-1 truncate text-xs text-muted">{r.detalle}</p>
                  <div className="flex w-48 items-center justify-end gap-4">
                    <Badge tone={prioridadTone(r.prioridad)}>{r.prioridad}</Badge>
                    <span className="w-20 text-right text-xs text-muted">{formatDate(r.fecha)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}