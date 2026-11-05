import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/ingredientes")({
  head: () => pageHead("Gestión de ingredientes", "Administra ingredientes, unidades base, categorías y conflictos alimentarios.", { private: true }),
  component: GestionDeIngredientesPage,
});

function GestionDeIngredientesPage() {
  return (
    <StagePlaceholder
      eyebrow="Administración"
      title="Gestión de ingredientes"
      description="Administra ingredientes, unidades base, categorías y conflictos alimentarios."
      stage={6}
      upcoming={["Crear y editar ingredientes", "Unidad base y categoría", "Grupo de alimentos", "Conflictos con etiquetas alimentarias"]}
    />
  );
}
