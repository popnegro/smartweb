import { Topbar } from "@/components/layout/Topbar";
import { AiCopilotClient } from "@/components/layout/AiCopilotClient";
import { getReclamos } from "@/lib/data";
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
      <Topbar title="AI Copilot" subtitle="Analiza reclamos utilizando la IA de Anthropic (Claude 3 Haiku)." />
      <AiCopilotClient reclamos={reclamos} />
    </>
  );
}