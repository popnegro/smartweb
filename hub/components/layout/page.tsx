import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ACCIONES } from "@/lib/data";
import type { EstadoAccion } from "@/lib/types";
import { AlarmClock, AlertCircle, CheckCircle2 } from "lucide-react";

const COLUMNAS: { estado: EstadoAccion; titulo: string; icono: React.ElementType }[] = [
  { estado: "Pendiente", titulo: "Acciones Pendientes", icono: AlertCircle },
  { estado: "En curso", titulo: "En Curso", icono: AlarmClock },
  { estado: "Completada", titulo: "Completadas", icono: CheckCircle2 },
];

const estadoAccionTone = (estado: EstadoAccion) => {
  if (estado === "Completada") return "good";
  if (estado === "En curso") return "info";
  return "critical";
};

export default function ActionCenterPage() {
  return (
    <>
      <Topbar
        title="Action Center"
        subtitle="Tareas y acciones sugeridas por la IA para resolver casos de clientes."
      />

      <main className="grid flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {COLUMNAS.map(({ estado, titulo, icono: Icono }) => {
          const acciones = ACCIONES.filter((a) => a.estado === estado);
          return (
            <div key={estado} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Icono className="h-4 w-4 text-muted" />
                <h2 className="text-sm font-semibold text-ink">{titulo}</h2>
                <span className="text-xs font-medium text-muted">{acciones.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {acciones.map((accion) => (
                  <Card key={accion.id} className="flex flex-col gap-3 p-4">
                    <p className="text-sm font-medium leading-snug text-ink">{accion.descripcion}</p>
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-medium text-muted">{accion.cliente}</p>
                      <div className="flex items-center gap-2">
                        <Badge tone={estadoAccionTone(estado)}>{accion.tiempoRecomendado}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
                {acciones.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-line py-12 text-center">
                    <p className="text-sm font-medium text-muted">No hay acciones</p>
                    <p className="text-xs text-muted">en esta columna</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}