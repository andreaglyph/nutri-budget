import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/recetas/$recipeId")({
  head: () => pageHead("Detalle de receta", "Ingredientes, cantidades, preparación y costo estimado de la receta.", { private: true }),
  component: DetalleDeRecetaPage,
});

function DetalleDeRecetaPage() {
  return (
    <StagePlaceholder
      eyebrow="Recetario"
      title="Detalle de receta"
      description="Ingredientes, cantidades, preparación y costo estimado de la receta."
      stage={3}
      upcoming={["Ingredientes con cantidades y unidades", "Pasos de preparación", "Costo estimado por porción y total", "Disponibilidad según tu inventario"]}
    />
  );
}
