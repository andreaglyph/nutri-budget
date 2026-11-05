import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/precios")({
  head: () => pageHead("Gestión de precios", "Registra y actualiza precios con fuente y fecha.", { private: true }),
  component: GestionDePreciosPage,
});

function GestionDePreciosPage() {
  return (
    <StagePlaceholder
      eyebrow="Administración"
      title="Gestión de precios"
      description="Registra y actualiza precios con fuente y fecha."
      stage={6}
      upcoming={["Registrar y actualizar precios", "Fuente y fecha de actualización", "Alerta de precios desactualizados", "Fuente definitiva pendiente de decisión"]}
    />
  );
}
