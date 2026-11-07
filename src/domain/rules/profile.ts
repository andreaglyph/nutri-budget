import type { DietarySelection, ID, MealType } from "@/domain/models";

export const MIN_HOUSEHOLD = 1;
export const MAX_HOUSEHOLD = 12;

export interface ProfileInput extends DietarySelection {
  name: string;
  householdSize: number;
  plannedMealTypes: MealType[];
}

export type ProfileValidationError = "NAME_REQUIRED" | "HOUSEHOLD_RANGE" | "MEALS_REQUIRED";

export const PROFILE_ERROR_MESSAGES: Record<ProfileValidationError, string> = {
  NAME_REQUIRED: "Escribe tu nombre.",
  HOUSEHOLD_RANGE: `Indica entre ${MIN_HOUSEHOLD} y ${MAX_HOUSEHOLD} personas.`,
  MEALS_REQUIRED: "Elige al menos una comida para planificar.",
};

export function validateProfile(input: Pick<ProfileInput, "name" | "householdSize" | "plannedMealTypes">): ProfileValidationError | null {
  if (!input.name.trim()) return "NAME_REQUIRED";
  if (!Number.isInteger(input.householdSize) || input.householdSize < MIN_HOUSEHOLD || input.householdSize > MAX_HOUSEHOLD) {
    return "HOUSEHOLD_RANGE";
  }
  if (input.plannedMealTypes.length === 0) return "MEALS_REQUIRED";
  return null;
}

/** Tags that exclude recipes: restrictions, allergies and intolerances. Never preferences. */
export function blockingTagIds(selection: DietarySelection): ID[] {
  return [...new Set([...selection.restrictionTagIds, ...selection.allergyTagIds])];
}

export const EMPTY_DIETARY_SELECTION: DietarySelection = {
  preferenceTagIds: [],
  restrictionTagIds: [],
  allergyTagIds: [],
  excludedIngredientIds: [],
};
