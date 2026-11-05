import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/recetas/$recipeId")({
  head: () => pageHead("Editar receta", "Edita la información de una receta del catálogo.", { private: true }),
  component: EditarRecetaPage,
});

function EditarRecetaPage() {
  return (
    <StagePlaceholder
      eyebrow="Administración"
      title="Editar receta"
      description="Edita la información de una receta del catálogo."
      stage={6}
      upcoming={["Datos generales y foto", "Ingredientes con cantidades en unidad base", "Pasos de preparación", "Tipos de comida y estado activo"]}
    />
  );
}
