import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { AUDITORIAS } from "@/lib/data";
import type { Hallazgo, AccionCorrectiva } from "@/lib/types";
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  FileText,
  Flag,
  ListChecks,
  ShieldCheck,
  User,
} from "lucide-react";
import { notFound } from "next/navigation";

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
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

function AccionCard({ accion }: { accion: AccionCorrectiva }) {
  const estadoColor = {
    Pendiente: "bg-yellow-50 text-yellow-700",
    "En curso": "bg-blue-50 text-blue-700",
    Completada: "bg-green-50 text-green-700",
  };

  return (
    <div className="border-t border-line py-3">
      <p className="text-sm text-ink/90">{accion.descripcion}</p>
      <div className="flex justify-between items-center mt-2 text-xs text-ink/70">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3" />
          <span>{accion.responsable}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>Límite: {new Date(accion.fechaLimite).toLocaleDateString()}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full font-semibold ${estadoColor[accion.estado]}`}>
          {accion.estado}
        </span>
      </div>
    </div>
  );
}

export default function AuditoriaDetallePage({ params }: { params: { id: string } }) {
  const auditoria = AUDITORIAS.find((a) => a.id === params.id);

  if (!auditoria) {
    notFound();
  }

  const criticidadColor = {
    Alta: "text-red-600",
    Media: "text-yellow-600",
    Baja: "text-gray-500",
  };

  return (
    <>
      <Topbar
        title={`Auditoría ${auditoria.id}`}
        subtitle={`Detalle de la auditoría en ${auditoria.area} de ${auditoria.sucursal}.`}
      />
      <main className="flex-1 space-y-6 p-6">
        <Card>
          <div className="p-5 border-b border-line">
            <h2 className="font-semibold text-lg text-ink">Información General</h2>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <InfoPill icon={Building} label="Sucursal" value={auditoria.sucursal} />
            <InfoPill icon={FileText} label="Área Auditada" value={auditoria.area} />
            <InfoPill
              icon={Calendar}
              label="Fecha"
              value={new Date(auditoria.fecha).toLocaleDateString()}
            />
            <InfoPill icon={User} label="Responsable" value={auditoria.responsable} />
            <InfoPill icon={ShieldCheck} label="Puntuación" value={`${auditoria.puntuacion}/100`} />
          </div>
        </Card>

        <Card>
          <div className="p-5 border-b border-line">
            <h2 className="font-semibold text-lg text-ink">Hallazgos y Acciones Correctivas</h2>
          </div>
          <div className="p-5 space-y-6">
            {auditoria.hallazgos.length > 0 ? (
              auditoria.hallazgos.map((hallazgo) => (
                <div key={hallazgo.id} className="bg-canvas p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flag className={`h-5 w-5 ${criticidadColor[hallazgo.criticidad]}`} />
                    <div>
                      <h3 className="font-semibold text-ink">{hallazgo.descripcion}</h3>
                      <p className={`text-xs font-bold ${criticidadColor[hallazgo.criticidad]}`}>
                        Criticidad {hallazgo.criticidad}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pl-8">
                    <h4 className="text-sm font-semibold text-ink/80 mb-2">Acciones Correctivas</h4>
                    <div className="space-y-2">
                      {hallazgo.accionesCorrectivas.map((accion) => (
                        <AccionCard key={accion.id} accion={accion} />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-lg font-medium text-ink">Sin Hallazgos</h3>
                <p className="mt-1 text-sm text-ink/70">
                  La auditoría se completó sin encontrar puntos de mejora.
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </>
  );
}