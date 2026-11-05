import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/")({
  head: () => pageHead("Dashboard", "Resumen de tu presupuesto, tus comidas, tu inventario y tus compras pendientes.", { private: true }),
  component: TuSemanaDeUnVistazoPage,
});

function TuSemanaDeUnVistazoPage() {
  return (
    <StagePlaceholder
      eyebrow="Dashboard"
      title="Tu semana de un vistazo"
      description="Resumen de tu presupuesto, tus comidas, tu inventario y tus compras pendientes."
      stage={3}
      upcoming={["Presupuesto semanal, gastos registrados, saldo y porcentaje usado", "Próxima comida, menú del día y comidas completadas", "Ingredientes por consumir pronto y por reponer", "Costo estimado y cantidad de productos por comprar", "Estado vacío cuando aún no has configurado tu información"]}
    />
  );
}
