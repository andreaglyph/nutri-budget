import { createFileRoute } from "@tanstack/react-router";

import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/perfil")({
  head: () => pageHead("Perfil y preferencias", "Administra tus datos, preferencias, restricciones, alergias y exclusiones.", { private: true }),
  component: PerfilYPreferenciasPage,
});

function PerfilYPreferenciasPage() {
  return (
    <StagePlaceholder
      eyebrow="Cuenta"
      title="Perfil y preferencias"
      description="Administra tus datos, preferencias, restricciones, alergias y exclusiones."
      stage={3}
      upcoming={["Datos personales y del hogar", "Preferencias, restricciones, alergias e intolerancias por separado", "Ingredientes excluidos voluntariamente", "Eliminar cuenta con doble confirmación"]}
    />
  );
}
