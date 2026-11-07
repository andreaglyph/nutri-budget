import type { ID, ProfileDetails } from "@/domain/models";
import { BUDGET_ERROR_MESSAGES, validateBudget, weeklyEndDate, type BudgetInput } from "@/domain/rules/budget";
import { PROFILE_ERROR_MESSAGES, validateProfile, type ProfileInput } from "@/domain/rules/profile";

import { newId, readDb, updateDb } from "./db";
import { buildBatch, type NewBatch } from "./inventory.service";
import { ApiError, simulateLatency } from "./simulated-api";

function assertProfile(input: ProfileInput) {
  const error = validateProfile(input);
  if (error) throw new ApiError(error, PROFILE_ERROR_MESSAGES[error]);
}

function applyProfile(db: ReturnType<typeof readDb>, userId: ID, input: ProfileInput, completed?: boolean) {
  const user = db.users.find((candidate) => candidate.id === userId);
  const profile = db.profiles.find((candidate) => candidate.userId === userId);
  const dietary = db.dietary.find((candidate) => candidate.userId === userId);
  if (!user || !profile || !dietary) throw new ApiError("NOT_FOUND", "No encontramos tu perfil.");
  user.name = input.name.trim();
  profile.householdSize = input.householdSize;
  profile.plannedMealTypes = input.plannedMealTypes;
  if (completed !== undefined) profile.onboardingCompleted = completed;
  dietary.preferenceTagIds = [...input.preferenceTagIds];
  dietary.restrictionTagIds = [...input.restrictionTagIds];
  dietary.allergyTagIds = [...input.allergyTagIds];
  dietary.excludedIngredientIds = [...input.excludedIngredientIds];
}

/** Mirrors /api/users/me/profile. */
export const profileService = {
  async getProfile(userId: ID): Promise<ProfileDetails> {
    await simulateLatency(200);
    const db = readDb();
    const user = db.users.find((candidate) => candidate.id === userId);
    const profile = db.profiles.find((candidate) => candidate.userId === userId);
    const dietary = db.dietary.find((candidate) => candidate.userId === userId);
    if (!user || !profile || !dietary) throw new ApiError("NOT_FOUND", "No encontramos tu perfil.");
    const { userId: _ignored, ...selection } = dietary;
    return { user, profile, ...selection };
  },

  async updateProfile(userId: ID, input: ProfileInput): Promise<void> {
    await simulateLatency();
    assertProfile(input);
    updateDb((db) => applyProfile(db, userId, input));
  },

  /** Onboarding: profile (step 1), first budget (step 2) and optional inventory (step 3) in one save. */
  async completeOnboarding(userId: ID, input: { profile: ProfileInput; budget: BudgetInput; inventory: NewBatch[] }): Promise<void> {
    await simulateLatency(600);
    assertProfile(input.profile);
    const existing = readDb().budgets.filter((budget) => budget.userId === userId);
    const budgetError = validateBudget(input.budget, existing);
    if (budgetError) throw new ApiError(budgetError, BUDGET_ERROR_MESSAGES[budgetError]);
    const batches = input.inventory.map((batch) => buildBatch(userId, batch));
    updateDb((db) => {
      applyProfile(db, userId, input.profile, true);
      db.budgets.push({
        id: newId("bud"),
        userId,
        amount: input.budget.amount,
        period: "WEEKLY",
        startDate: input.budget.startDate,
        endDate: weeklyEndDate(input.budget.startDate),
      });
      db.inventory.push(...batches);
    });
  },

  /** Removes the account and every record that belongs to it. */
  async deleteAccount(userId: ID): Promise<void> {
    await simulateLatency(600);
    updateDb((db) => {
      const purchaseIds = new Set(db.purchases.filter((purchase) => purchase.userId === userId).map((purchase) => purchase.id));
      db.users = db.users.filter((user) => user.id !== userId);
      db.credentials = db.credentials.filter((credential) => credential.userId !== userId);
      db.profiles = db.profiles.filter((profile) => profile.userId !== userId);
      db.dietary = db.dietary.filter((record) => record.userId !== userId);
      db.budgets = db.budgets.filter((budget) => budget.userId !== userId);
      db.inventory = db.inventory.filter((batch) => batch.userId !== userId);
      db.purchases = db.purchases.filter((purchase) => purchase.userId !== userId);
      db.purchaseItems = db.purchaseItems.filter((item) => !purchaseIds.has(item.purchaseId));
    });
  },
};
