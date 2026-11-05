import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/historial/$planId")({
  head: () => pageHead("Menú anterior", "Detalle de un menú semanal anterior con sus costos originales.", { private: true }),
  component: MenuAnteriorPage,
});

function MenuAnteriorPage() {
  return (
    <StagePlaceholder
      eyebrow="Historial"
      title="Menú anterior"
      description="Detalle de un menú semanal anterior con sus costos originales."
      stage={5}
      upcoming={["Calendario de esa semana", "Costos tal como se calcularon", "Compras asociadas", "Estado final del menú"]}
    />
  );
}
