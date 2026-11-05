import { createFileRoute } from "@tanstack/react-router";

import { ProvisionalNote } from "@/components/common/ProvisionalNote";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacidad")({
  head: () => pageHead("Tratamiento de datos personales", "Cómo NutriBudget trata tus datos personales y alimentarios."),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicLayout>
      <article className="container-page max-w-2xl space-y-5 py-12 text-foreground md:py-20">
        <h1 className="text-title">Tratamiento de datos personales</h1>
        <ProvisionalNote label="Texto pendiente">
          la política definitiva debe ajustarse a la normativa colombiana de protección de datos y ser aprobada por el
          equipo.
        </ProvisionalNote>
        <p className="text-muted-foreground">
          Usamos tu nombre, correo, presupuesto, inventario y compras únicamente para planear tus comidas y mostrarte
          tus gastos.
        </p>
        <p className="text-muted-foreground">
          Tus preferencias, restricciones, alergias e intolerancias pueden ser información sensible. Solo se usan para
          excluir recetas que no te convienen y no se muestran a otras personas.
        </p>
        <p className="text-muted-foreground">
          Cada usuario ve solo su propia información. Al eliminar tu cuenta se eliminan tus datos personales.
        </p>
      </article>
    </PublicLayout>
  );
}
