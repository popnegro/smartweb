import { Search, Bell } from "lucide-react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-surface/80 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-muted sm:flex">
          <Search className="h-4 w-4" />
          <span>Buscar cliente, patente o ID…</span>
          <kbd className="ml-2 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </div>
        <button
          aria-label="Notificaciones"
          className="relative rounded-lg border border-line bg-surface p-2 text-ink/60 hover:bg-canvas"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-signal-critical" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lorenzo text-sm font-semibold text-white">
          RC
        </div>
      </div>
    </header>
  );
}
