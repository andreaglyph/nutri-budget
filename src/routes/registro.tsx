import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/registro")({
  head: () => pageHead("Crear cuenta", "Crea tu cuenta de NutriBudget y configura tu hogar en tres pasos."),
  component: RegisterPage,
});

const FIELDS = [
  "Nombre, correo y contraseña con confirmación",
  "Aceptación de términos y condiciones",
  "Autorización del tratamiento de datos personales",
  "Validaciones con mensajes claros en cada campo",
];

function RegisterPage() {
  return (
    <PublicLayout>
      <div className="container-page max-w-2xl py-12 md:py-20">
        <Badge variant="warning">Etapa 3</Badge>
        <h1 className="text-title mt-4 text-foreground">Crea tu cuenta</h1>
        <p className="mt-2 text-muted-foreground">
          El formulario de registro se habilita en la siguiente etapa del prototipo. Mientras tanto, puedes recorrer la
          aplicación con la cuenta de demostración.
        </p>
        <ul className="mt-8 space-y-3 surface-card p-6">
          {FIELDS.map((field) => (
            <li key={field} className="flex items-start gap-3 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {field}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/ingresar">Probar con la cuenta demo</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
