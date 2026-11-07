import type { Budget, ID, Purchase } from "@/domain/models";
import { BUDGET_ERROR_MESSAGES, validateBudget, weeklyEndDate, type BudgetInput } from "@/domain/rules/budget";

import { newId, readDb, updateDb } from "./db";
import { ApiError, simulateLatency } from "./simulated-api";

function assertValid(input: BudgetInput, existing: Budget[], ignoreId?: string) {
  const error = validateBudget(input, existing, ignoreId);
  if (error) throw new ApiError(error, BUDGET_ERROR_MESSAGES[error]);
}

/** Mirrors /api/users/me/budgets. */
export const budgetService = {
  async list(userId: ID): Promise<Budget[]> {
    await simulateLatency(250);
    return readDb()
      .budgets.filter((budget) => budget.userId === userId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  async create(userId: ID, input: BudgetInput): Promise<Budget> {
    await simulateLatency();
    const existing = readDb().budgets.filter((budget) => budget.userId === userId);
    assertValid(input, existing);
    const budget: Budget = {
      id: newId("bud"),
      userId,
      amount: input.amount,
      period: "WEEKLY",
      startDate: input.startDate,
      endDate: weeklyEndDate(input.startDate),
    };
    updateDb((db) => db.budgets.push(budget));
    return budget;
  },

  async update(userId: ID, id: ID, input: BudgetInput): Promise<void> {
    await simulateLatency();
    const existing = readDb().budgets.filter((budget) => budget.userId === userId);
    if (!existing.some((budget) => budget.id === id)) throw new ApiError("NOT_FOUND", "Este presupuesto ya no existe.");
    assertValid(input, existing, id);
    updateDb((db) => {
      const budget = db.budgets.find((candidate) => candidate.id === id);
      if (!budget) return;
      budget.amount = input.amount;
      budget.startDate = input.startDate;
      budget.endDate = weeklyEndDate(input.startDate);
    });
  },
};

/** Mirrors GET /api/users/me/purchases. Registering purchases arrives in stage 5. */
export const purchaseService = {
  async list(userId: ID): Promise<Purchase[]> {
    await simulateLatency(250);
    return readDb()
      .purchases.filter((purchase) => purchase.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
};
