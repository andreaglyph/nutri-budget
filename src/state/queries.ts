import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";

import type { ID } from "@/domain/models";
import { indexCatalog } from "@/domain/rules/catalog";
import { budgetService, purchaseService } from "@/services/budget.service";
import { catalogService } from "@/services/catalog.service";
import { inventoryService } from "@/services/inventory.service";
import { profileService } from "@/services/profile.service";

export const queryKeys = {
  catalog: ["catalog"] as const,
  profile: (userId: ID) => ["profile", userId] as const,
  budgets: (userId: ID) => ["budgets", userId] as const,
  purchases: (userId: ID) => ["purchases", userId] as const,
  inventory: (userId: ID) => ["inventory", userId] as const,
};

export const catalogQuery = () =>
  queryOptions({ queryKey: queryKeys.catalog, queryFn: () => catalogService.getCatalog(), staleTime: Infinity });

export const profileQuery = (userId: ID) =>
  queryOptions({ queryKey: queryKeys.profile(userId), queryFn: () => profileService.getProfile(userId) });

export const budgetsQuery = (userId: ID) =>
  queryOptions({ queryKey: queryKeys.budgets(userId), queryFn: () => budgetService.list(userId) });

export const purchasesQuery = (userId: ID) =>
  queryOptions({ queryKey: queryKeys.purchases(userId), queryFn: () => purchaseService.list(userId) });

export const inventoryQuery = (userId: ID) =>
  queryOptions({ queryKey: queryKeys.inventory(userId), queryFn: () => inventoryService.list(userId) });

/** Signed-in user id inside the /app area (set by the layout guard). */
export function useUserId(): ID {
  return useRouteContext({ from: "/app" }).session.userId;
}

export function useCatalog() {
  const { data } = useSuspenseQuery(catalogQuery());
  const index = useMemo(() => indexCatalog(data), [data]);
  return { catalog: data, index };
}
