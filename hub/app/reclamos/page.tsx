import { Topbar } from "@/components/layout/Topbar";
import { RECLAMOS } from "@/lib/data";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/DataTable";

export default function CustomerRecoveryPage() {
  const data = RECLAMOS;

  return (
    <>
      <Topbar
        title="Customer Recovery"
        subtitle="Gestión y seguimiento de reclamos de clientes."
      />
      <main className="flex-1 space-y-6 p-6">
        <div className="container mx-auto py-2">
          <DataTable
            columns={columns}
            data={data}
            filterColumn="cliente"
            filterPlaceholder="Filtrar por cliente..."
            basePath="/reclamos"
          />
        </div>
      </main>
    </>
  );
}