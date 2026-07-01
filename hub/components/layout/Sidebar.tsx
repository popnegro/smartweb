"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareWarning,
  ClipboardCheck,
  KanbanSquare,
  Building2,
  Sparkles,
} from "lucide-react";

function cn(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, active: true },
  { href: "/reclamos", label: "Customer Recovery", icon: MessageSquareWarning, active: true },
  { href: "/auditorias", label: "Auditorías de Calidad", icon: ClipboardCheck, active: true },
  { href: "/action-center", label: "Action Center", icon: KanbanSquare, active: true },
  { href: "/sucursales", label: "Sucursales", icon: Building2, active: true },
  { href: "/ai-copilot", label: "AI Copilot", icon: Sparkles, active: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lorenzo text-sm font-bold text-white">
          CX
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">Quality Hub</p>
          <p className="text-xs text-muted">Grupo Lorenzo</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const isActive = item.active && pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.active ? item.href : "#"}
              aria-disabled={!item.active}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-lorenzo/10 text-lorenzo"
                  : item.active
                  ? "text-ink/70 hover:bg-canvas hover:text-ink"
                  : "cursor-default text-ink/30"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {!item.active && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-muted">
                  pronto
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-lg bg-canvas p-4">
        <p className="text-xs font-medium text-ink">MVP v0.1</p>
        <p className="mt-1 text-xs text-muted">
          Datos de demostración. Próximo paso: conectar IA real y base de datos.
        </p>
      </div>
    </aside>
  );
}
