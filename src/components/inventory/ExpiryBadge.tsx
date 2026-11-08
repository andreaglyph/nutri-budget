import { Badge } from "@/components/ui/badge";
import type { BatchStatus } from "@/domain/rules/inventory";

const LABELS: Record<BatchStatus, { label: string; variant: "success" | "warning" | "destructive" | "neutral" }> = {
  AVAILABLE: { label: "Disponible", variant: "success" },
  EXPIRING: { label: "Por consumir pronto", variant: "warning" },
  EXPIRED: { label: "Vencido", variant: "destructive" },
  DEPLETED: { label: "Agotado", variant: "neutral" },
};

export function ExpiryBadge({ status }: { status: BatchStatus }) {
  const config = LABELS[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/** "Vence hoy", "Vence en 2 días", "Venció hace 1 día", "Sin fecha". */
export function daysLabel(days: number | null): string {
  if (days === null) return "Sin fecha de vencimiento";
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  if (days > 1) return `Vence en ${days} días`;
  const ago = Math.abs(days);
  return `Venció hace ${ago} ${ago === 1 ? "día" : "días"}`;
}
