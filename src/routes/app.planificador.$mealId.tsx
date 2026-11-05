import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/planificador/$mealId")({
  head: () => pageHead("Detalle de comida", "Detalle de una comida del menú semanal con ingredientes disponibles y faltantes.", { private: true }),
  component: DetalleDeComidaPage,
});

function DetalleDeComidaPage() {
  return (
    <StagePlaceholder
      eyebrow="Planificador"
      title="Detalle de comida"
      description="Detalle de una comida del menú semanal con ingredientes disponibles y faltantes."
      stage={4}
      upcoming={["Receta, porciones y costo congelado", "Ingredientes disponibles y faltantes", "Cambiar esta receta por otra compatible", "Estado: planificada, cocinada u omitida"]}
    />
  );
}
