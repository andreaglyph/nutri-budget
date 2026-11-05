import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            Alimentación inteligente, saludable y económica. Planea tus comidas con tu presupuesto y lo que ya
            tienes en casa.
          </p>
        </div>
        <nav aria-label="Producto" className="text-sm">
          <p className="font-semibold text-foreground">Producto</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><a className="hover:text-foreground" href="/#como-funciona">Cómo funciona</a></li>
            <li><a className="hover:text-foreground" href="/#funcionalidades">Funcionalidades</a></li>
            <li><Link className="hover:text-foreground" to="/registro">Crear cuenta</Link></li>
            <li><Link className="hover:text-foreground" to="/ingresar">Ingresar</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal" className="text-sm">
          <p className="font-semibold text-foreground">Legal</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link className="hover:text-foreground" to="/terminos">Términos y condiciones</Link></li>
            <li><Link className="hover:text-foreground" to="/privacidad">Tratamiento de datos personales</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 NutriBudget · Colombia</p>
          <p>Prototipo de validación. Los precios mostrados son estimaciones de ejemplo.</p>
        </div>
      </div>
    </footer>
  );
}
