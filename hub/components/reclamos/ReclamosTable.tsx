"use client";

import { useMemo, useState } from "react";
import type { Reclamo } from "@/lib/types";
import { Badge, riesgoTone, prioridadTone, estadoTone } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ReclamoDetailPanel } from "@/components/reclamos/ReclamoDetailPanel";
import { Search } from "lucide-react";

export function ReclamosTable({ reclamos }: { reclamos: Reclamo[] }) {
  const [query, setQuery] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Todos");
  const [selected, setSelected] = useState<Reclamo | null>(null);

  const estados = ["Todos", "Nuevo", "En curso", "Esperando cliente", "Resuelto"];

  const filtered = useMemo(() => {
    return reclamos.filter((r) => {
      const matchesQuery =
        query.trim() === "" ||
        r.cliente.toLowerCase().includes(query.toLowerCase()) ||
        r.patente.toLowerCase().includes(query.toLowerCase()) ||
        r.id.toLowerCase().includes(query.toLowerCase());
      const matchesEstado = estadoFiltro === "Todos" || r.estado === estadoFiltro;
      return matchesQuery && matchesEstado;
    });
  }, [reclamos, query, estadoFiltro]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 sm:w-72">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente, patente o ID…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {estados.map((e) => (
            <button
              key={e}
              onClick={() => setEstadoFiltro(e)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                estadoFiltro === e
                  ? "bg-lorenzo text-white"
                  : "bg-canvas text-muted hover:bg-line"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Sucursal</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Riesgo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-canvas"
                >
                  <td className="px-4 py-3 font-medium text-ink">{r.id}</td>
                  <td className="px-4 py-3 text-ink">
                    <div>{r.cliente}</div>
                    <div className="text-xs text-muted">{r.vehiculo} · {r.patente}</div>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{r.sucursal}</td>
                  <td className="px-4 py-3">
                    <Badge tone={prioridadTone(r.prioridad)}>{r.prioridad}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={riesgoTone(r.riesgo)}>{r.riesgo}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={estadoTone(r.estado)}>{r.estado}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{formatDate(r.fecha)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">
                    No se encontraron reclamos con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        Mostrando {filtered.length} de {reclamos.length} reclamos
      </p>

      <ReclamoDetailPanel reclamo={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
