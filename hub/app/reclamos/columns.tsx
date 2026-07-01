"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Reclamo } from "@/lib/types";
import { Badge, prioridadTone, riesgoTone, estadoTone } from "@/components/ui/Badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

function formatDate(d: string | Date) {
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch {
    return String(d);
  }
}

export const columns: ColumnDef<Reclamo>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "cliente",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Cliente
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("cliente")}</div>,
  },
  {
    accessorKey: "sucursal",
    header: "Sucursal",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as Reclamo["estado"];
      return <Badge tone={estadoTone(estado)}>{estado}</Badge>;
    },
  },
  {
    accessorKey: "prioridad",
    header: "Prioridad",
    cell: ({ row }) => {
      const prioridad = row.getValue("prioridad") as Reclamo["prioridad"];
      return <Badge tone={prioridadTone(prioridad)}>{prioridad}</Badge>;
    },
  },
  {
    accessorKey: "riesgo",
    header: "Riesgo",
    cell: ({ row }) => {
      const riesgo = row.getValue("riesgo") as Reclamo["riesgo"];
      return <Badge tone={riesgoTone(riesgo)}>{riesgo}</Badge>;
    },
  },
  {
    accessorKey: "responsable",
    header: "Responsable",
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Fecha
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{formatDate(row.getValue("fecha"))}</div>,
  },
];