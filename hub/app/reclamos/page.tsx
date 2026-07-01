import { Topbar } from "@/components/layout/Topbar";
import { ReclamosTable } from "@/components/reclamos/ReclamosTable";
import { RECLAMOS } from "@/lib/data";

export default function ReclamosPage() {
  return (
    <>
      <Topbar
        title="Customer Recovery"
        subtitle="Gestión de reclamos con priorización asistida por IA"
      />
      <main className="flex-1 p-6">
        <ReclamosTable reclamos={RECLAMOS} />
      </main>
    </>
  );
}
