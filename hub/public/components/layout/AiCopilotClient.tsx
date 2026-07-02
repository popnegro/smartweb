"use client";

import { useState } from "react";
import { AiInsightCard } from "@/components/ui/AiInsightCard";
import { Card } from "@/components/ui/Card";
import type { Reclamo } from "@/lib/types";
import {
  Sparkles,
  Bot,
  AlertTriangle,
  LoaderCircle,
  Smile,
  HeartCrack,
  Clock,
} from "lucide-react";

type Analysis = {
  resumen: string;
  sentimiento: string;
  probabilidadAbandono: number;
  accionSugerida: string;
  tiempoRecomendado: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function AiCopilotClient({ reclamos }: { reclamos: Reclamo[] }) {
  const [selectedReclamoId, setSelectedReclamoId] = useState<string>(reclamos[0]?.id || "");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleAnalyze = async () => {
    const reclamo = reclamos.find((r) => r.id === selectedReclamoId);
    if (!reclamo) return;

    setStatus("loading");
    setAnalysis(null);

    try {
      // Note: The fetch path includes the basePath defined in next.config.js
      const response = await fetch("/hub/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reclamo }),
      });

      if (!response.ok) {
        throw new Error(`Error de la API: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data);
      setStatus("success");
    } catch (error) {
      console.error("Error al analizar con la IA:", error);
      setStatus("error");
    }
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedReclamoId}
            onChange={(e) => setSelectedReclamoId(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-lorenzo focus:outline-none"
          >
            {reclamos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} - {r.cliente} - {r.detalle.substring(0, 50)}...
              </option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 rounded-lg bg-lorenzo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-lorenzo/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Analizar con IA
          </button>
        </div>
      </Card>

      {status === "loading" && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <p className="text-sm">Analizando con Claude 3 Haiku...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-red-200 bg-red-50 py-12 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-medium">Error al contactar la API. Verifica tu ANTHROPIC_API_KEY.</p>
        </div>
      )}

      {status === "success" && analysis && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-lorenzo" />
              <h2 className="text-base font-semibold text-ink">Resumen del Caso</h2>
            </div>
            <p className="text-sm text-ink/90">{analysis.resumen}</p>
          </Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AiInsightCard icon={Smile} title="Sentimiento" value={analysis.sentimiento} color={analysis.sentimiento === "Negativo" ? "text-signal-critical" : "text-signal-warning"} />
            <AiInsightCard icon={HeartCrack} title="Riesgo de Abandono" value={`${analysis.probabilidadAbandono}%`} color="text-signal-critical" />
            <AiInsightCard icon={Clock} title="Resolución Sugerida" value={analysis.tiempoRecomendado} />
          </div>
        </div>
      )}
    </main>
  );
}