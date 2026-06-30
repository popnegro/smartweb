import { cn } from "@/lib/utils";

type Tone = "critical" | "warning" | "good" | "info" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  critical: "bg-red-50 text-signal-critical ring-1 ring-inset ring-red-200",
  warning: "bg-amber-50 text-signal-warning ring-1 ring-inset ring-amber-200",
  good: "bg-emerald-50 text-signal-good ring-1 ring-inset ring-emerald-200",
  info: "bg-sky-50 text-signal-info ring-1 ring-inset ring-sky-200",
  neutral: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone]
      )}
    >
      {children}
    </span>
  );
}

export function riesgoTone(riesgo: string): Tone {
  if (riesgo === "Crítico") return "critical";
  if (riesgo === "Moderado") return "warning";
  return "good";
}

export function prioridadTone(prioridad: string): Tone {
  if (prioridad === "Alta") return "critical";
  if (prioridad === "Media") return "warning";
  return "info";
}

export function estadoTone(estado: string): Tone {
  if (estado === "Resuelto") return "good";
  if (estado === "Nuevo") return "info";
  if (estado === "Esperando cliente") return "warning";
  return "neutral";
}
