import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/recetas/")({
  head: () => pageHead("Gestión de recetas", "Crea, edita y desactiva recetas del catálogo.", { private: true }),
  component: GestionDeRecetasPage,
});

function GestionDeRecetasPage() {
  return (
    <StagePlaceholder
      eyebrow="Administración"
      title="Gestión de recetas"
      description="Crea, edita y desactiva recetas del catálogo."
      stage={6}
      upcoming={["Crear, editar y desactivar recetas", "Ingredientes, porciones y tiempos", "Tipos de comida y grupos alimentarios", "Búsqueda y filtros"]}
    />
  );
}
