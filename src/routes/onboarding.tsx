import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";
import { StagePlaceholder } from "@/components/common/StagePlaceholder";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => pageHead("Configura tu hogar", "Configura tu perfil, presupuesto e inventario en tres pasos.", { private: true }),
  beforeLoad: ({ location }) => {
    if (!authService.getSession()) {
      throw redirect({ to: "/ingresar", search: { redirect: location.href } });
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container-page flex h-16 items-center justify-between">
        <Logo />
        <Button variant="ghost" asChild>
          <Link to="/app">Ir al dashboard</Link>
        </Button>
      </header>
      <main className="container-page max-w-3xl py-10">
        <StagePlaceholder
          eyebrow="Configuración inicial"
          title="Configura tu hogar en tres pasos"
          description="Así NutriBudget puede proponerte un menú que respete tu presupuesto y tus restricciones."
          stage={3}
          upcoming={[
            "Paso 1: perfil, integrantes del hogar y comidas a planificar",
            "Preferencias, restricciones, alergias y exclusiones por separado",
            "Paso 2: presupuesto semanal con fechas de inicio y fin",
            "Paso 3: inventario inicial (opcional, se puede omitir)",
          ]}
        />
      </main>
    </div>
  );
}
