import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/recetas/")({
  head: () => pageHead("Recetas", "Explora recetas colombianas con costo estimado, tiempo y porciones.", { private: true }),
  component: RecetasPage,
});

function RecetasPage() {
  return (
    <StagePlaceholder
      eyebrow="Recetario"
      title="Recetas"
      description="Explora recetas colombianas con costo estimado, tiempo y porciones."
      stage={3}
      upcoming={["Tarjetas con foto, tiempo, porciones y costo estimado", "Filtros por comida, tiempo, ingrediente, categoría y preferencia", "Recetas como arepa con huevo, lentejas o sudado de pollo", "Etiquetas alimentarias y grupos de alimentos"]}
    />
  );
}
