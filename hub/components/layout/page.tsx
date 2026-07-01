import { Topbar } from "@/components/layout/Topbar";
import { AiCopilotClient } from "@/components/layout/AiCopilotClient";
import { AiInsightCard } from "@/components/ui/AiInsightCard";
import { Card } from "@/components/ui/Card";
import { getReclamos } from "@/lib/data";
import type { Reclamo } from "@/lib/types";
import {
  Sparkles,
  Bot,
  AlertTriangle,
  LoaderCircle,
  Smile,
  HeartCrack,
  Clock,
} from "lucide-react";

export default async function AiCopilotPage() {
  const reclamos = await getReclamos();

  return (
    <>
      <Topbar
        title="AI Copilot"
        subtitle="Analiza reclamos utilizando la IA de Anthropic (Claude 3 Haiku)."
      />
      <AiCopilotClient reclamos={reclamos} />
    </>
  );
}