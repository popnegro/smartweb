import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { RECLAMOS } from "@/lib/data";
import {
  AlertTriangle,
  BarChart,
  Building,
  Calendar,
  FileText,
  Info,
  MessageSquare,
  Smile,
  User,
  Car,
  Clock,
  Zap,
} from "lucide-react";
import { notFound } from "next/navigation";

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-ink/60 mt-0.5" />
      <div>
        <p className="text-xs text-ink/70">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function ReclamoDetallePage({ params }: { params: { id: string } }) {
  const reclamo = RECLAMOS.find((r) => r.id === params.id);

  if (!reclamo) {
    notFound();
  }

  const prioridadColor = {
    Alta: "text-red-600 bg-red-50",
    Media: "text-yellow-600 bg-yellow-50",
    Baja: "text-green-600 bg-green-50",
  };

  return (
    <>
      <Topbar
        title={`Reclamo ${reclamo.id}`}
        subtitle={`Detalle del caso de ${reclamo.cliente} en ${reclamo.sucursal}.`}
      />
      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-5 border-b border-line">
                <h2 className="font-semibold text-lg text-ink">Detalles del Reclamo</h2>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <InfoPill icon={User} label="Cliente" value={reclamo.cliente} />
                  <InfoPill icon={Car} label="Vehículo" value={reclamo.vehiculo} />
                  <InfoPill icon={Building} label="Sucursal" value={reclamo.sucursal} />
                  <InfoPill icon={FileText} label="Área" value={reclamo.area} />
                  <InfoPill
                    icon={Calendar}
                    label="Fecha de Reclamo"
                    value={new Date(reclamo.fecha).toLocaleDateString()}
                  />
                  <InfoPill icon={User} label="Responsable" value={reclamo.responsable} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink/80">Descripción del problema</p>
                  <p className="text-ink/90">{reclamo.detalle}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-5 border-b border-line">
                <h2 className="font-semibold text-lg text-ink">Línea de Tiempo</h2>
              </div>
              <div className="p-5">
                <div className="relative border-l border-dashed border-line ml-3">
                  {reclamo.timeline.map((evento, index) => (
                    <div key={index} className="flex items-start gap-4 mb-6 ml-8">
                      <div className="absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-lorenzo/10 text-lorenzo">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-ink">{evento.evento}</p>
                        <p className="text-xs text-ink/70">
                          {new Date(evento.fecha).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="font-semibold text-ink mb-4">Estado y Prioridad</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink/80">Estado</span>
                  <span className="font-bold text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {reclamo.estado}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink/80">Prioridad</span>
                  <span
                    className={`font-bold text-sm px-2 py-1 rounded-full ${
                      prioridadColor[reclamo.prioridad]
                    }`}
                  >
                    {reclamo.prioridad}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold text-ink mb-4">Análisis de IA</h2>
              <div className="space-y-4 text-sm">
                <InfoPill icon={Zap} label="Acción Sugerida" value={reclamo.ia.accionSugerida} />
                <InfoPill icon={Smile} label="Sentimiento" value={reclamo.ia.sentimiento} />
                <InfoPill
                  icon={AlertTriangle}
                  label="Riesgo de Abandono"
                  value={`${reclamo.ia.probabilidadAbandono}%`}
                />
                <InfoPill
                  icon={Clock}
                  label="Tiempo de Resolución Sugerido"
                  value={reclamo.ia.tiempoRecomendado}
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}