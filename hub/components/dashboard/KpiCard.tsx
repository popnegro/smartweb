import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = "good",
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "good" | "critical";
  icon: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <Icon className="h-4 w-4 text-muted" strokeWidth={2} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            deltaTone === "good" ? "text-signal-good" : "text-signal-critical"
          )}
        >
          {delta}
        </p>
      )}
    </Card>
  );
}
