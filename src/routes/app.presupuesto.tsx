import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/presupuesto")({
  head: () => pageHead("Mi presupuesto", "Crea y consulta tu presupuesto semanal en pesos colombianos.", { private: true }),
  component: MiPresupuestoPage,
});

function MiPresupuestoPage() {
  return (
    <StagePlaceholder
      eyebrow="Presupuesto"
      title="Mi presupuesto"
      description="Crea y consulta tu presupuesto semanal en pesos colombianos."
      stage={3}
      upcoming={["Crear, consultar y modificar el presupuesto semanal", "Gastos acumulados y saldo disponible", "Comparación entre costo estimado y gasto real", "Validación de valor positivo y periodos sin solapamiento"]}
    />
  );
}
