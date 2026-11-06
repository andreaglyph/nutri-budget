import type { BaseUnit, ID, ISODate, UserInventory } from "@/domain/models";

import { daysBetween } from "./dates";

/** Batches whose best-before date is this close (or past) are "por consumir pronto". */
export const EXPIRING_SOON_DAYS = 3;

/**
 * Example restock thresholds per base unit. Provisional: the SRS does not define
 * reorder levels, so the UI labels this as an example criterion.
 */
export const LOW_STOCK_THRESHOLD: Record<BaseUnit, number> = { g: 100, ml: 100, unit: 2 };

export type BatchStatus = "AVAILABLE" | "EXPIRING" | "EXPIRED" | "DEPLETED";

export function batchStatus(batch: Pick<UserInventory, "quantity" | "bestBefore">, today: ISODate): BatchStatus {
  if (batch.quantity <= 0) return "DEPLETED";
  if (!batch.bestBefore) return "AVAILABLE";
  const days = daysBetween(today, batch.bestBefore);
  if (days < 0) return "EXPIRED";
  if (days <= EXPIRING_SOON_DAYS) return "EXPIRING";
  return "AVAILABLE";
}

export function daysUntilBestBefore(bestBefore: ISODate | null, today: ISODate): number | null {
  return bestBefore ? daysBetween(today, bestBefore) : null;
}

/** FEFO order: earliest best-before first; batches without a date go last. */
export function sortByBestBefore<T extends Pick<UserInventory, "bestBefore" | "registeredAt">>(batches: readonly T[]): T[] {
  return [...batches].sort((a, b) => {
    if (a.bestBefore === b.bestBefore) return a.registeredAt.localeCompare(b.registeredAt);
    if (!a.bestBefore) return 1;
    if (!b.bestBefore) return -1;
    return a.bestBefore.localeCompare(b.bestBefore);
  });
}

/** Usable quantity per ingredient: excludes depleted and expired batches. */
export function usableQuantityByIngredient(batches: readonly UserInventory[], today: ISODate): Map<ID, number> {
  const totals = new Map<ID, number>();
  for (const batch of batches) {
    const status = batchStatus(batch, today);
    if (status === "DEPLETED" || status === "EXPIRED") continue;
    totals.set(batch.ingredientId, (totals.get(batch.ingredientId) ?? 0) + batch.quantity);
  }
  return totals;
}

export function isLowStock(totalQuantity: number, baseUnit: BaseUnit): boolean {
  return totalQuantity < LOW_STOCK_THRESHOLD[baseUnit];
}

export interface InventoryOverview {
  available: number;
  expiringSoon: number;
  expired: number;
  depleted: number;
}

export function inventoryOverview(batches: readonly UserInventory[], today: ISODate): InventoryOverview {
  const overview: InventoryOverview = { available: 0, expiringSoon: 0, expired: 0, depleted: 0 };
  for (const batch of batches) {
    const status = batchStatus(batch, today);
    if (status === "AVAILABLE") overview.available += 1;
    else if (status === "EXPIRING") overview.expiringSoon += 1;
    else if (status === "EXPIRED") overview.expired += 1;
    else overview.depleted += 1;
  }
  return overview;
}
