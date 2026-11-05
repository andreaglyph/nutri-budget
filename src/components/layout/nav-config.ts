import {
  BookOpen,
  CalendarDays,
  Carrot,
  History,
  LayoutDashboard,
  Receipt,
  Refrigerator,
  ShoppingBasket,
  Tags,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type WorkspacePath =
  | "/app"
  | "/app/presupuesto"
  | "/app/inventario"
  | "/app/recetas"
  | "/app/planificador"
  | "/app/lista-compras"
  | "/app/gastos"
  | "/app/historial"
  | "/app/perfil"
  | "/admin"
  | "/admin/recetas"
  | "/admin/ingredientes"
  | "/admin/precios";

export interface NavItem {
  to: WorkspacePath;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const dashboard: NavItem = { to: "/app", label: "Dashboard", shortLabel: "Inicio", icon: LayoutDashboard, exact: true };
const budget: NavItem = { to: "/app/presupuesto", label: "Mi presupuesto", icon: Wallet };
const inventory: NavItem = { to: "/app/inventario", label: "Mi inventario", shortLabel: "Despensa", icon: Refrigerator };
const recipes: NavItem = { to: "/app/recetas", label: "Recetas", icon: BookOpen };
const planner: NavItem = { to: "/app/planificador", label: "Planificador semanal", shortLabel: "Menú", icon: CalendarDays };
const shopping: NavItem = { to: "/app/lista-compras", label: "Lista de compras", shortLabel: "Compras", icon: ShoppingBasket };
const spending: NavItem = { to: "/app/gastos", label: "Seguimiento de gastos", icon: Receipt };
const history: NavItem = { to: "/app/historial", label: "Historial", icon: History };
const profile: NavItem = { to: "/app/perfil", label: "Perfil y preferencias", icon: UserRound };

export const APP_NAV: NavGroup[] = [
  { label: "Planear", items: [dashboard, budget, inventory, recipes, planner] },
  { label: "Comprar y seguir", items: [shopping, spending, history] },
  { label: "Cuenta", items: [profile] },
];

/** Bottom bar on mobile: four destinations + "Más". */
export const APP_MOBILE_PRIMARY: NavItem[] = [dashboard, planner, shopping, inventory];

const adminHome: NavItem = { to: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true };
const adminRecipes: NavItem = { to: "/admin/recetas", label: "Recetas", icon: BookOpen };
const adminIngredients: NavItem = { to: "/admin/ingredientes", label: "Ingredientes", icon: Carrot };
const adminPrices: NavItem = { to: "/admin/precios", label: "Precios", icon: Tags };

export const ADMIN_NAV: NavGroup[] = [
  { label: "Catálogo", items: [adminHome, adminRecipes, adminIngredients, adminPrices] },
];

export const ADMIN_MOBILE_PRIMARY: NavItem[] = [adminHome, adminRecipes, adminIngredients, adminPrices];
