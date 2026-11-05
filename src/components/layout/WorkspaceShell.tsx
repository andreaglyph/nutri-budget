import { Link } from "@tanstack/react-router";
import { CalendarPlus, Ellipsis, ReceiptText, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { Session } from "@/domain/models";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";

import type { NavGroup, NavItem } from "./nav-config";
import { UserMenu } from "./UserMenu";

interface WorkspaceShellProps {
  area: "app" | "admin";
  session: Session;
  groups: NavGroup[];
  mobilePrimary: NavItem[];
  children: ReactNode;
}

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: (() => void) | undefined }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.exact ?? false }}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-secondary data-[status=active]:text-primary-strong"
    >
      <Icon className="size-[1.125rem] shrink-0 text-muted-foreground group-hover:text-primary group-data-[status=active]:text-primary" aria-hidden="true" />
      {item.label}
    </Link>
  );
}

function NavGroups({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-eyebrow px-3 pb-2 text-muted-foreground">{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceShell({ area, session, groups, mobilePrimary, children }: WorkspaceShellProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdmin = area === "admin";

  useEffect(() => {
    const flash = authService.consumeFlash();
    if (flash) toast.error(flash);
  }, []);

  const homePath = isAdmin ? "/admin" : "/app";

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-raised"
      >
        Saltar al contenido
      </a>

      {/* Desktop sidebar */}
      <aside
        aria-label={isAdmin ? "Navegación administrativa" : "Navegación principal"}
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <Link to={homePath} aria-label="Inicio de tu espacio">
            <Logo />
          </Link>
        </div>
        {isAdmin && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-highlight-soft px-3 py-2 text-xs font-semibold text-highlight-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" /> Área de administración
          </div>
        )}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavGroups groups={groups} />
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">
            Prototipo con datos de demostración. Nada se envía a un servidor.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <Link to={homePath} className="lg:hidden" aria-label="Inicio de tu espacio">
              <Logo showWordmark={false} />
            </Link>
            <div className="hidden items-center gap-2 lg:flex">
              {isAdmin ? (
                <Badge variant="warning">
                  <ShieldCheck /> Rol ADMIN
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Hola, <span className="font-semibold text-foreground">{session.name.split(" ")[0]}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <div className="hidden items-center gap-2 md:flex">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/app/gastos/nueva">
                      <ReceiptText /> Registrar compra
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/app/planificador">
                      <CalendarPlus /> Generar menú
                    </Link>
                  </Button>
                </div>
              )}
              <UserMenu session={session} area={area} />
            </div>
          </div>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pt-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact ?? false }}
                  className="flex flex-col items-center gap-1 px-1 py-2.5 text-[0.6875rem] font-medium text-muted-foreground data-[status=active]:text-primary"
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="truncate">{item.shortLabel ?? item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[0.6875rem] font-medium text-muted-foreground",
                moreOpen && "text-primary",
              )}
              aria-haspopup="dialog"
            >
              <Ellipsis className="size-5" aria-hidden="true" />
              Más
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetTitle className="mb-4 font-display text-lg">Todas las secciones</SheetTitle>
          <NavGroups groups={groups} onNavigate={() => setMoreOpen(false)} />
          {!isAdmin && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link to="/app/gastos/nueva" onClick={() => setMoreOpen(false)}>
                  <ReceiptText /> Registrar compra
                </Link>
              </Button>
              <Button asChild>
                <Link to="/app/planificador" onClick={() => setMoreOpen(false)}>
                  <CalendarPlus /> Generar menú
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
