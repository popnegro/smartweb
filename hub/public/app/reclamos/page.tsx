import { Topbar } from "@/components/layout/Topbar";
import { getReclamos } from "@/lib/data";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/DataTable";

export default async function CustomerRecoveryPage() {
  const data = await getReclamos();

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