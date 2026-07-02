import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface AiInsightCardProps {
  icon: LucideIcon;
  title: string;
  value: string | React.ReactNode;
  description?: string;
  color?: string;
}

export function AiInsightCard({ icon: Icon, title, value, description, color = "text-lorenzo" }: AiInsightCardProps) {
  return (
    <Card className="flex items-start gap-4 p-4">
      <div className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${color}/10`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted">{title}</p>
        <p className="text-base font-semibold text-ink">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted">{description}</p>
        )}
      </div>
    </Card>
  );
}