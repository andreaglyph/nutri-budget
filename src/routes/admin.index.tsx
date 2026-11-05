import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead("Administración", "Resumen del catálogo de recetas, ingredientes y precios.", { private: true }),
  component: ResumenDelCatalogoPage,
});

function ResumenDelCatalogoPage() {
  return (
    <StagePlaceholder
      eyebrow="Administración"
      title="Resumen del catálogo"
      description="Resumen del catálogo de recetas, ingredientes y precios."
      stage={6}
      upcoming={["Recetas activas e inactivas", "Ingredientes por categoría", "Precios desactualizados que requieren revisión", "Accesos rápidos a cada gestión"]}
    />
  );
}
