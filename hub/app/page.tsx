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
        subtitle="Visión general de calidad y experiencia del cliente — Grupo Lorenzo"
      />

      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="NPS actual" value={String(kpis.nps)} delta="+7 vs. mes anterior" icon={Gauge} />
          <KpiCard label="CSAT actual" value={`${kpis.csat}%`} delta="+2 pts vs. mes anterior" icon={Gauge} />
          <KpiCard
            label="Reclamos abiertos"
            value={String(kpis.reclamosAbiertos)}
            delta={`${kpis.totalReclamos} reclamos totales (45 días)`}
            deltaTone="critical"
            icon={MessageSquareWarning}
          />
          <KpiCard
            label="Tiempo prom. resolución"
            value={`${kpis.tiempoPromedioHoras} hs`}
            delta="Meta: 24 hs"
            deltaTone="critical"
            icon={Clock3}
          />
        </div>

        <DashboardClient trendData={TREND} sucursalKpis={SUCURSAL_KPIS} />

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-signal-critical" />
              <p className="text-sm font-semibold text-ink">Clientes en riesgo crítico</p>
            </div>
            <Link href="/reclamos" className="text-xs font-medium text-lorenzo hover:underline">
              Ver todos los reclamos →
            </Link>
          </div>

          {criticos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No hay clientes en riesgo crítico abiertos en este momento.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {criticos.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{r.cliente}</p>
                    <p className="text-xs text-muted">
                      {r.sucursal} · {r.vehiculo} · {formatDate(r.fecha)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={prioridadTone(r.prioridad)}>{r.prioridad}</Badge>
                    <Badge tone={riesgoTone(r.riesgo)}>{r.riesgo}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
