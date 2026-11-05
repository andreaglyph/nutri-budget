import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/gastos/nueva")({
  head: () => pageHead("Registrar compra", "Registra una compra real y asóciala a tu presupuesto y lista de compras.", { private: true }),
  component: RegistrarCompraPage,
});

function RegistrarCompraPage() {
  return (
    <StagePlaceholder
      eyebrow="Gastos"
      title="Registrar compra"
      description="Registra una compra real y asóciala a tu presupuesto y lista de compras."
      stage={5}
      upcoming={["Fecha, productos, cantidades y valor pagado", "Vinculación opcional a la lista de compras", "Compras parciales de la lista", "Agregar sobrante al inventario (provisional)"]}
    />
  );
}
