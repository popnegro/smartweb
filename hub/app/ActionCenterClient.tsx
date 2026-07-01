"use client";

import { useState } from "react";
import type { AccionCorrectiva, EstadoAccion } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, formatDate } from "@/lib/utils";
import { Badge, prioridadTone } from "@/components/ui/Badge";
import { Calendar, User } from "lucide-react";

const KANBAN_COLUMNS: Record<EstadoAccion, string> = {
  Pendiente: "Pendiente",
  "En curso": "En Curso",
  Bloqueado: "Bloqueado",
  Finalizado: "Finalizado",
};

function ActionCard({ action }: { action: AccionCorrectiva }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3 touch-none rounded-lg border border-line bg-surface p-3.5 shadow-sm"
    >
      <p className="text-sm font-medium text-ink">{action.descripcion}</p>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(action.fechaLimite)}</span>
        </div>
        <Badge tone={prioridadTone(action.prioridad)}>{action.prioridad}</Badge>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <User className="h-3.5 w-3.5" />
        <span>{action.responsable}</span>
      </div>
    </div>
  );
}

function KanbanColumn({
  title,
  actions,
  columnId,
}: {
  title: string;
  actions: AccionCorrectiva[];
  columnId: EstadoAccion;
}) {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-canvas">
      <div className="flex items-center justify-between p-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className="text-xs font-medium text-muted">{actions.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 pt-0">
        <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function ActionCenterClient({ initialActions }: { initialActions: AccionCorrectiva[] }) {
  const [actions, setActions] = useState<AccionCorrectiva[]>(initialActions);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex((item) => item.id === active.id);
      const newContainer = over.data.current?.sortable.containerId as EstadoAccion;
      if (newContainer) {
        const updatedActions = [...actions];
        updatedActions[oldIndex] = { ...updatedActions[oldIndex], estado: newContainer };
        setActions(updatedActions);
      }
    }
  };

  const columns = Object.keys(KANBAN_COLUMNS) as EstadoAccion[];

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="inline-flex h-full min-w-full space-x-4">
            {columns.map((columnId) => (
              <KanbanColumn
                key={columnId}
                columnId={columnId}
                title={KANBAN_COLUMNS[columnId]}
                actions={actions.filter((a) => a.estado === columnId)}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </main>
  );
}