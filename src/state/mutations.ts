import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ID } from "@/domain/models";
import type { BudgetInput } from "@/domain/rules/budget";
import type { ProfileInput } from "@/domain/rules/profile";
import { authService } from "@/services/auth.service";
import { budgetService } from "@/services/budget.service";
import { inventoryService, type NewBatch } from "@/services/inventory.service";
import { profileService } from "@/services/profile.service";

import { queryKeys } from "./queries";

export function useSaveBudget(userId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: ID | undefined; input: BudgetInput }) =>
      id ? budgetService.update(userId, id, input) : budgetService.create(userId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.budgets(userId) }),
  });
}

export function useSaveBatch(userId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: ID | undefined; input: NewBatch }) =>
      id ? inventoryService.update(userId, id, input) : inventoryService.add(userId, input).then(() => undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory(userId) }),
  });
}

export function useBatchAction(userId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: ID; action: "deplete" | "remove" }) =>
      action === "deplete" ? inventoryService.markDepleted(userId, id) : inventoryService.remove(userId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory(userId) }),
  });
}

export function useUpdateProfile(userId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => profileService.updateProfile(userId, input),
    onSuccess: async () => {
      authService.refreshSession();
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
  });
}

export function useCompleteOnboarding(userId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof profileService.completeOnboarding>[1]) =>
      profileService.completeOnboarding(userId, input),
    onSuccess: async () => {
      authService.refreshSession();
      await queryClient.invalidateQueries();
    },
  });
}
