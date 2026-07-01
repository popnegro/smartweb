"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { RECLAMOS } from "@/lib/data";
import type { Reclamo } from "@/lib/types";
import { Sparkles, Bot, AlertTriangle, LoaderCircle } from "lucide-react";

type Analysis = {
  resumen: string;
  sentimiento: string;
  probabilidadAbandono: number;
  accionSugerida: string;
  tiempoRecomendado: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function AiCopilotPage() {
  const [selectedReclamoId, setSelectedReclamoId] = useState<string>(RECLAMOS[0].id);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleAnalyze = async () => {
    const reclamo = RECLAMOS.find((r) => r.id === selectedReclamoId);
    if (!reclamo) return;

    setStatus("loading");
    setAnalysis(null);

    try {
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
    <>
      <Topbar
        title="AI Copilot"
        subtitle="Analiza reclamos utilizando la IA de Anthropic (Claude 3 Haiku)."
      />

      <main className="flex-1 space-y-6 p-6">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedReclamoId}
              onChange={(e) => setSelectedReclamoId(e.target.value)}
              className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-lorenzo focus:outline-none"
            >
              {RECLAMOS.map((r) => (
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
            <p className="text-sm font-medium">
              Error al contactar la API. Verifica tu ANTHROPIC_API_KEY.
            </p>
          </div>
        )}

        {status === "success" && analysis && (
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-lorenzo" />
              <h2 className="text-base font-semibold text-ink">Análisis de la IA</h2>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-canvas p-4 text-sm text-ink">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </Card>
        )}
      </main>
    </>
  );
}