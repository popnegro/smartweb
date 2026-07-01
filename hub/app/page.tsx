import { Topbar } from "@/components/layout/Topbar";
import { AiCopilotClient } from "@/components/layout/AiCopilotClient";
import { getReclamos } from "@/lib/data";

export default async function AiCopilotPage() {
  const reclamos = await getReclamos();

  return (
    <>
      <Topbar
        title="AI Copilot"
        subtitle="Analiza reclamos utilizando la IA de Ollama (Llama 3)."
      />
      <AiCopilotClient reclamos={reclamos} />
    </>
  );
}