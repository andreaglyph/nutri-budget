import { createFileRoute } from "@tanstack/react-router";

import { ProvisionalNote } from "@/components/common/ProvisionalNote";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terminos")({
  head: () => pageHead("Términos y condiciones", "Condiciones de uso del prototipo de NutriBudget."),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicLayout>
      <article className="container-page max-w-2xl space-y-5 py-12 text-foreground md:py-20">
        <h1 className="text-title">Términos y condiciones</h1>
        <ProvisionalNote label="Texto pendiente">
          el texto legal definitivo debe ser redactado y aprobado por el equipo antes del lanzamiento.
        </ProvisionalNote>
        <p className="text-muted-foreground">
          NutriBudget es una herramienta de organización de comidas, compras y presupuesto. No ofrece
          recomendaciones médicas, diagnósticos ni planes nutricionales personalizados.
        </p>
        <p className="text-muted-foreground">
          Los precios que muestra la aplicación son estimaciones de referencia y pueden diferir de los precios reales
          de cada establecimiento.
        </p>
        <p className="text-muted-foreground">
          Al crear una cuenta se registra la fecha en que aceptas estas condiciones. Puedes eliminar tu cuenta en
          cualquier momento desde tu perfil.
        </p>
      </article>
    </PublicLayout>
  );
}
