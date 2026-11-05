import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/state/use-session";

const SECTIONS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#funcionalidades", label: "Funcionalidades" },
  { href: "/#aprovechar", label: "Aprovechar alimentos" },
];

export function PublicHeader() {
  const session = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="NutriBudget, inicio">
          <Logo />
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-7 md:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <Button asChild>
              <Link to={session.role === "ADMIN" ? "/admin" : "/app"}>Ir a mi espacio</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/ingresar">Ingresar</Link>
              </Button>
              <Button asChild>
                <Link to="/registro">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-6">
            <SheetTitle asChild>
              <span>
                <Logo />
              </span>
            </SheetTitle>
            <nav aria-label="Secciones" className="flex flex-col gap-1">
              {SECTIONS.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {section.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2">
              {session ? (
                <Button asChild>
                  <Link to={session.role === "ADMIN" ? "/admin" : "/app"}>Ir a mi espacio</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/registro">Crear cuenta</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/ingresar">Ingresar</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
