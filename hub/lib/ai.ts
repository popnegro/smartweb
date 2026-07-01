import { RECLAMOS, SUCURSAL_KPIS, COMENTARIOS } from "./data";
import React from "react";
import type { SucursalKpi } from "./types";

function SimpleTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="min-w-full divide-y-2 divide-line bg-surface text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-2 text-left font-medium text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="whitespace-nowrap px-4 py-2 text-muted">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function getMockAiResponse(question: string): React.ReactNode {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("sucursal") && lowerQuestion.includes("reclamos")) {
    const ranking = [...SUCURSAL_KPIS].sort((a, b) => b.reclamos - a.reclamos);
    return (
      <div>
        <p className="mb-2">
          Aquí está el ranking de sucursales por cantidad de reclamos en los últimos 45 días:
        </p>
        <SimpleTable
          headers={["Sucursal", "Reclamos"]}
          rows={ranking.map((s) => [s.sucursal, s.reclamos])}
        />
      </div>
    );
  }

  if (lowerQuestion.includes("nps")) {
    return "La caída del NPS en el último período se debe principalmente a un aumento en los comentarios negativos sobre 'Demoras en la atención' en la sucursal de Recepción, lo cual ha generado una fricción crítica en el Journey del cliente.";
  }

  if (lowerQuestion.includes("problemas")) {
    return (
      <div>
        <p>Los principales problemas detectados en los comentarios de clientes son:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Demoras excesivas en la atención, especialmente en Recepción.</li>
          <li>Falta de comunicación sobre el estado de los repuestos.</li>
          <li>Diferencias entre el presupuesto inicial y la facturación final.</li>
        </ul>
      </div>
    );
  }

  return "No he podido procesar esa pregunta. Intenta reformularla o prueba con una de las sugerencias.";
}