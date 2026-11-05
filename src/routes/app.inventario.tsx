import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/inventario")({
  head: () => pageHead("Mi inventario", "Administra los ingredientes que tienes en casa por lotes y fecha de consumo preferente.", { private: true }),
  component: MiInventarioPage,
});

function MiInventarioPage() {
  return (
    <StagePlaceholder
      eyebrow="Inventario"
      title="Mi inventario"
      description="Administra los ingredientes que tienes en casa por lotes y fecha de consumo preferente."
      stage={3}
      upcoming={["Lotes del mismo ingrediente con fechas distintas", "Pestañas: disponibles, por consumir y agotados", "Búsqueda, filtro por categoría y orden por fecha", "Unidades base (g, ml, unidad) con conversión a kg y litros"]}
    />
  );
}
