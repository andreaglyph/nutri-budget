import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/lista-compras")({
  head: () => pageHead("Lista de compras", "Lista generada desde tu menú con solo lo que falta comprar.", { private: true }),
  component: ListaDeComprasPage,
});

function ListaDeComprasPage() {
  return (
    <StagePlaceholder
      eyebrow="Compras"
      title="Lista de compras"
      description="Lista generada desde tu menú con solo lo que falta comprar."
      stage={4}
      upcoming={["Ingredientes agrupados, sin repetir por receta", "Necesario, en casa y por comprar", "Precio estimado, subtotal y total", "Casillas para marcar productos y filtros por categoría"]}
    />
  );
}
