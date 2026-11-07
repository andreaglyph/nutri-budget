import type { BaseUnit, ID, ISODate, UserInventory } from "@/domain/models";

import { daysBetween, isValidISODate } from "./dates";

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

export interface BatchInput {
  ingredientId: ID;
  /** Quantity in the chosen presentation unit. */
  quantity: number;
  unitCode: string;
  bestBefore: ISODate | null;
}

export type BatchValidationError = "INGREDIENT_REQUIRED" | "QUANTITY_NOT_POSITIVE" | "UNIT_INCOMPATIBLE" | "INVALID_DATE";

export const BATCH_ERROR_MESSAGES: Record<BatchValidationError, string> = {
  INGREDIENT_REQUIRED: "Elige un ingrediente.",
  QUANTITY_NOT_POSITIVE: "La cantidad debe ser mayor que cero.",
  UNIT_INCOMPATIBLE: "Esa unidad no corresponde al ingrediente.",
  INVALID_DATE: "Revisa la fecha de vencimiento.",
};

export function validateBatchInput(
  input: BatchInput,
  ingredientBaseUnit: BaseUnit | undefined,
  unitBase: BaseUnit | undefined,
): BatchValidationError | null {
  if (!input.ingredientId || !ingredientBaseUnit) return "INGREDIENT_REQUIRED";
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return "QUANTITY_NOT_POSITIVE";
  if (!unitBase || unitBase !== ingredientBaseUnit) return "UNIT_INCOMPATIBLE";
  if (input.bestBefore !== null && !isValidISODate(input.bestBefore)) return "INVALID_DATE";
  return null;
}

export interface IngredientStock<T extends UserInventory = UserInventory> {
  ingredientId: ID;
  /** FEFO-ordered batches. */
  batches: T[];
  usableQuantity: number;
  nearestBestBefore: ISODate | null;
}

/** Groups batches per ingredient, FEFO order inside each group. */
export function groupBatchesByIngredient(batches: readonly UserInventory[], today: ISODate): IngredientStock[] {
  const groups = new Map<ID, UserInventory[]>();
  for (const batch of batches) {
    const list = groups.get(batch.ingredientId) ?? [];
    list.push(batch);
    groups.set(batch.ingredientId, list);
  }
  return [...groups.entries()].map(([ingredientId, list]) => {
    const ordered = sortByBestBefore(list);
    const usable = ordered.filter((batch) => {
      const status = batchStatus(batch, today);
      return status === "AVAILABLE" || status === "EXPIRING";
    });
    return {
      ingredientId,
      batches: ordered,
      usableQuantity: usable.reduce((sum, batch) => sum + batch.quantity, 0),
      nearestBestBefore: usable.find((batch) => batch.bestBefore)?.bestBefore ?? null,
    };
  });
}
