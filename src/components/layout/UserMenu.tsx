import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Session } from "@/domain/models";
import { initials } from "@/domain/rules/format";
import { authService } from "@/services/auth.service";

interface UserMenuProps {
  session: Session;
  area: "app" | "admin";
}

export function UserAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 place-items-center rounded-full bg-secondary font-display text-sm font-bold text-primary-strong"
    >
      {initials(name)}
    </span>
  );
}

export function UserMenu({ session, area }: UserMenuProps) {
  const navigate = useNavigate();

  const logout = () => {
    authService.logout();
    toast.success("Cerraste sesión", { description: "Tus datos de demostración siguen guardados en este navegador." });
    navigate({ to: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-secondary sm:pr-3"
        aria-label={`Menú de ${session.name}`}
      >
        <UserAvatar name={session.name} />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-foreground">{session.name}</span>
          <span className="block text-xs leading-tight text-muted-foreground">
            {session.role === "ADMIN" ? "Administrador" : "Usuario"}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold text-foreground">{session.name}</p>
          <p className="truncate text-xs text-muted-foreground">{session.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/app/perfil">
            <UserRound /> Perfil y preferencias
          </Link>
        </DropdownMenuItem>
        {session.role === "ADMIN" && area === "app" && (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <ShieldCheck /> Panel de administración
            </Link>
          </DropdownMenuItem>
        )}
        {area === "admin" && (
          <DropdownMenuItem asChild>
            <Link to="/app">
              <LayoutDashboard /> Ir a la aplicación
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
