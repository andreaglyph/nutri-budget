import type { Budget, ISODate } from "@/domain/models";

import { addDays, daysBetween, isValidISODate } from "./dates";

/** Weekly budgets always span 7 calendar days (start + 6). */
export const WEEKLY_BUDGET_DAYS = 7;
/** Share of the budget from which the UI warns that the limit is near. */
export const NEAR_LIMIT_RATIO = 0.85;

export function weeklyEndDate(startDate: ISODate): ISODate {
  return addDays(startDate, WEEKLY_BUDGET_DAYS - 1);
}

export interface BudgetInput {
  amount: number;
  startDate: ISODate;
}

export type BudgetValidationError = "AMOUNT_NOT_POSITIVE" | "AMOUNT_NOT_INTEGER" | "INVALID_DATE" | "OVERLAP";

export function rangesOverlap(aStart: ISODate, aEnd: ISODate, bStart: ISODate, bEnd: ISODate): boolean {
  return daysBetween(aStart, bEnd) >= 0 && daysBetween(bStart, aEnd) >= 0;
}

/** Returns the first existing budget overlapping the candidate period (ignoring `ignoreId`). */
export function findOverlappingBudget(
  budgets: readonly Budget[],
  startDate: ISODate,
  endDate: ISODate,
  ignoreId?: string,
): Budget | undefined {
  return budgets.find(
    (budget) => budget.id !== ignoreId && rangesOverlap(budget.startDate, budget.endDate, startDate, endDate),
  );
}

export function validateBudget(
  input: BudgetInput,
  existing: readonly Budget[],
  ignoreId?: string,
): BudgetValidationError | null {
  if (!Number.isFinite(input.amount) || input.amount <= 0) return "AMOUNT_NOT_POSITIVE";
  if (!Number.isInteger(input.amount)) return "AMOUNT_NOT_INTEGER";
  if (!isValidISODate(input.startDate)) return "INVALID_DATE";
  const overlap = findOverlappingBudget(existing, input.startDate, weeklyEndDate(input.startDate), ignoreId);
  return overlap ? "OVERLAP" : null;
}

export const BUDGET_ERROR_MESSAGES: Record<BudgetValidationError, string> = {
  AMOUNT_NOT_POSITIVE: "El presupuesto debe ser mayor que $ 0 COP.",
  AMOUNT_NOT_INTEGER: "Escribe el valor en pesos, sin centavos.",
  INVALID_DATE: "Elige una fecha de inicio válida.",
  OVERLAP: "Ya tienes un presupuesto que cubre parte de esas fechas. Cambia la fecha de inicio o edita el existente.",
};

export function findBudgetForDate(budgets: readonly Budget[], date: ISODate): Budget | undefined {
  return budgets.find((budget) => daysBetween(budget.startDate, date) >= 0 && daysBetween(date, budget.endDate) >= 0);
}

export type BudgetStatus = "WITHIN" | "NEAR_LIMIT" | "OVER";

export interface BudgetSummary {
  amount: number;
  spent: number;
  balance: number;
  /** 0–100+, rounded to one decimal. */
  percentUsed: number;
  status: BudgetStatus;
}

/** Real spending vs budget. `spent` must come from purchase line totals. */
export function summarizeBudget(amount: number, spent: number): BudgetSummary {
  const balance = amount - spent;
  const ratio = amount > 0 ? spent / amount : 0;
  const status: BudgetStatus = ratio > 1 ? "OVER" : ratio >= NEAR_LIMIT_RATIO ? "NEAR_LIMIT" : "WITHIN";
  return { amount, spent, balance, percentUsed: Math.round(ratio * 1000) / 10, status };
}
