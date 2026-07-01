"use client";

import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";

type Tone = "positive" | "critical" | "neutral";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  deltaTone = "neutral",
}: {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  deltaTone?: Tone;
}) {
  const toneClasses: Record<Tone, string> = {
    positive: "text-green-600",
    critical: "text-red-600",
    neutral: "text-muted",
  };

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span>{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className={`mt-1 text-xs ${toneClasses[deltaTone]}`}>{delta}</p>
    </Card>
  );
}