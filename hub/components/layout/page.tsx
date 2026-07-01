import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AUDITORIAS } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { ClipboardCheck } from "lucide-react";

const estadoAuditoriaTone = (estado: string) => {
  if (estado === "Completada") return "good";
  if (estado === "En curso") return "info";
  if (estado === "Cancelada") return "critical";
  return "neutral";
};

export default function AuditoriasPage() {
  return (
    <>
      <Topbar
        title="Auditorías de Calidad"
        subtitle="Seguimiento de auditorías internas de procesos y estándares."
      />

      <main className="flex-1 space-y-6 p-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-muted" />
            <p className="text-sm font-semibold text-ink">Auditorías Recientes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  <th className="px-4 py-2 font-medium">Sucursal</th>
                  <th className="px-4 py-2 font-medium">Área</th>
                  <th className="px-4 py-2 font-medium">Puntuación</th>
                  <th className="px-4 py-2 font-medium">Responsable</th>
                  <th className="px-4 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm text-ink">
                {AUDITORIAS.map((auditoria) => (
                  <tr key={auditoria.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{auditoria.id}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(auditoria.fecha)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{auditoria.sucursal}</td>
                    <td className="whitespace-nowrap px-4 py-3">{auditoria.area}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{auditoria.puntuacion}%</td>
                    <td className="whitespace-nowrap px-4 py-3">{auditoria.responsable}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={estadoAuditoriaTone(auditoria.estado)}>{auditoria.estado}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  );
}