import * as React from "react";
import { cn } from "@/lib/utils";
import type { Prioridad, Riesgo, EstadoReclamo } from "@/lib/types";

export type BadgeTone = "neutral" | "info" | "good" | "warning" | "critical";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "border-transparent bg-muted text-muted-foreground",
  info: "border-transparent bg-sky-100 text-sky-800",
  good: "border-transparent bg-emerald-100 text-emerald-800",
  warning: "border-transparent bg-amber-100 text-amber-800",
  critical: "border-transparent bg-red-100 text-red-800",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: BadgeTone;
}

function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeTones[tone],
        className
      )}
      {...props}
    />
  );
}

const prioridadMap: Record<Prioridad, BadgeTone> = {
  Alta: "critical",
  Media: "warning",
  Baja: "info",
};
export const prioridadTone = (prioridad: Prioridad): BadgeTone =>
  prioridadMap[prioridad];

const riesgoMap: Record<Riesgo, BadgeTone> = {
  Crítico: "critical",
  Moderado: "warning",
  Bajo: "good",
};
export const riesgoTone = (riesgo: Riesgo): BadgeTone =>
  riesgoMap[riesgo];

const estadoMap: Record<EstadoReclamo, BadgeTone> = {
  Resuelto: "good",
  "En curso": "info",
  "Esperando cliente": "warning",
  Nuevo: "neutral",
};
export const estadoTone = (estado: EstadoReclamo): BadgeTone =>
  estadoMap[estado];

export { Badge };