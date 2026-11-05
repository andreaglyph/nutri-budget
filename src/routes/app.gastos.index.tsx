import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/gastos/")({
  head: () => pageHead("Seguimiento de gastos", "Compara lo estimado con lo que realmente pagaste.", { private: true }),
  component: SeguimientoDeGastosPage,
});

function SeguimientoDeGastosPage() {
  return (
    <StagePlaceholder
      eyebrow="Gastos"
      title="Seguimiento de gastos"
      description="Compara lo estimado con lo que realmente pagaste."
      stage={5}
      upcoming={["Compras registradas con valor real por línea", "Presupuesto, costo estimado, costo real y diferencia", "Gráfica sencilla de estimado frente a real", "Saldo disponible de la semana"]}
    />
  );
}
