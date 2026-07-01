import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { getDashboardKpis, RECLAMOS, AUDITORIAS } from "@/lib/data";
import type { Reclamo, Auditoria } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  FileText,
  ShieldCheck,
  Smile,
  ListChecks,
} from "lucide-react";
import Link from "next/link";

function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink/80">{title}</p>
        <Icon className="h-5 w-5 text-ink/60" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-ink">{value}</p>
        {trend &&
          (trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const kpis = getDashboardKpis();
  const ultimosReclamos = RECLAMOS.slice(0, 5);
  const ultimasAuditorias = AUDITORIAS.slice(0, 5);

  return (
    <>
      <Topbar
        title="Dashboard Principal"
        subtitle="Visión general de la performance y estado de la operación."
      />
      <main className="flex-1 space-y-6 p-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard title="NPS" value={kpis.nps} icon={Smile} trend="up" />
          <KpiCard title="CSAT" value={`${kpis.csat}%`} icon={Smile} trend="up" />
          <KpiCard title="Reclamos Abiertos" value={kpis.reclamosAbiertos} icon={FileText} />
          <KpiCard title="Clientes Críticos" value={kpis.clientesCriticos} icon={Users} trend="down" />
          <KpiCard
            title="Tiempo Prom. (hs)"
            value={kpis.tiempoPromedioHoras}
            icon={Clock}
            trend="down"
          />
          <KpiCard title="Auditorías" value={AUDITORIAS.length} icon={ListChecks} />
        </div>

        {/* Resúmenes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h2 className="font-semibold text-ink">Últimos Reclamos</h2>
            <div className="mt-4 flow-root">
              <div className="-my-2 divide-y divide-line">
                {ultimosReclamos.map((reclamo: Reclamo) => (
                  <Link
                    key={reclamo.id}
                    href={`/reclamos/${reclamo.id}`}
                    className="flex items-center gap-4 py-3 hover:bg-canvas"
                  >
                    <FileText className="h-5 w-5 text-ink/60" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">
                        {reclamo.cliente} - {reclamo.area}
                      </p>
                      <p className="text-xs text-ink/70">{reclamo.detalle}</p>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        reclamo.prioridad === "Alta"
                          ? "text-red-600"
                          : reclamo.prioridad === "Media"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {reclamo.prioridad}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink">Últimas Auditorías</h2>
            <div className="mt-4 flow-root">
              <div className="-my-2 divide-y divide-line">
                {ultimasAuditorias.map((auditoria: Auditoria) => (
                  <Link
                    key={auditoria.id}
                    href="/auditorias"
                    className="flex items-center gap-4 py-3 hover:bg-canvas"
                  >
                    <ShieldCheck className="h-5 w-5 text-ink/60" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">
                        {auditoria.id} - {auditoria.area}
                      </p>
                      <p className="text-xs text-ink/70">{auditoria.sucursal}</p>
                    </div>
                    <span className="text-sm font-semibold text-ink">
                      {auditoria.puntuacion}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}