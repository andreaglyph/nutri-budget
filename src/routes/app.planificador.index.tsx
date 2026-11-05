import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/planificador/")({
  head: () => pageHead("Planificador semanal", "Genera tu menú semanal según presupuesto, inventario y preferencias.", { private: true }),
  component: PlanificadorSemanalPage,
});

function PlanificadorSemanalPage() {
  return (
    <StagePlaceholder
      eyebrow="Planificador"
      title="Planificador semanal"
      description="Genera tu menú semanal según presupuesto, inventario y preferencias."
      stage={4}
      upcoming={["Configuración: semana, personas, presupuesto y comidas", "Calendario por días y comidas, también en móvil", "Cambiar una receta por otra y regenerar el menú", "Desglose de los cinco costos y saldo estimado"]}
    />
  );
}
