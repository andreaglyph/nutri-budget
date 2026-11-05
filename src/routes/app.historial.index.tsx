import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/historial/")({
  head: () => pageHead("Historial", "Consulta menús, presupuestos y compras de semanas anteriores.", { private: true }),
  component: HistorialPage,
});

function HistorialPage() {
  return (
    <StagePlaceholder
      eyebrow="Historial"
      title="Historial"
      description="Consulta menús, presupuestos y compras de semanas anteriores."
      stage={5}
      upcoming={["Menús anteriores con costos congelados", "Presupuestos y compras por semana", "Recetas utilizadas", "Evolución del presupuesto"]}
    />
  );
}
