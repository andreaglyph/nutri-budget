import type {
  DietaryTag,
  ID,
  Ingredient,
  IngredientDietConflict,
  IngredientPrice,
  MealType,
  RecipeDetail,
  RecipeIngredient,
} from "@/domain/models";

import { roundQuantity } from "./units";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Desayuno",
  LUNCH: "Almuerzo",
  DINNER: "Cena",
};

export const MEAL_TYPE_ORDER: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

/** Quantity of an ingredient for `servings`, scaled from the recipe base servings. */
export function scaleQuantity(quantity: number, recipeServings: number, servings: number): number {
  if (recipeServings <= 0) throw new Error("La receta debe tener porciones válidas");
  return roundQuantity((quantity * servings) / recipeServings);
}

export function scaleIngredients(recipe: Pick<RecipeDetail, "ingredients" | "servings">, servings: number): RecipeIngredient[] {
  return recipe.ingredients.map((item) => ({ ...item, quantity: scaleQuantity(item.quantity, recipe.servings, servings) }));
}

/** Latest price per ingredient (by updatedAt). */
export function latestPrices(prices: readonly IngredientPrice[]): Map<ID, IngredientPrice> {
  const map = new Map<ID, IngredientPrice>();
  for (const price of prices) {
    const current = map.get(price.ingredientId);
    if (!current || price.updatedAt > current.updatedAt) map.set(price.ingredientId, price);
  }
  return map;
}

export interface RecipeCost {
  total: number;
  perServing: number;
  /** Ingredients without a registered price — cost is then incomplete. */
  missingPrices: ID[];
}

/** Total estimated cost of all ingredients (not what the user must buy). Rounded to whole pesos. */
export function recipeCost(
  recipe: Pick<RecipeDetail, "ingredients" | "servings">,
  servings: number,
  prices: Map<ID, IngredientPrice>,
): RecipeCost {
  let total = 0;
  const missingPrices: ID[] = [];
  for (const item of scaleIngredients(recipe, servings)) {
    const price = prices.get(item.ingredientId);
    if (!price) {
      missingPrices.push(item.ingredientId);
      continue;
    }
    total += item.quantity * price.pricePerBaseUnit;
  }
  const rounded = Math.round(total);
  return { total: rounded, perServing: servings > 0 ? Math.round(total / servings) : 0, missingPrices };
}

export interface IncompatibilityReason {
  kind: "TAG" | "EXCLUSION";
  ingredientId: ID;
  /** Present when kind = TAG. */
  tagId?: ID;
}

/**
 * Why a recipe is incompatible with the user's hard rules (restrictions, allergies,
 * intolerances) and voluntary exclusions. Preferences never make a recipe incompatible.
 */
export function incompatibilityReasons(
  recipe: Pick<RecipeDetail, "ingredients">,
  conflicts: readonly IngredientDietConflict[],
  blockingTagIds: readonly ID[],
  excludedIngredientIds: readonly ID[],
): IncompatibilityReason[] {
  const reasons: IncompatibilityReason[] = [];
  const blocking = new Set(blockingTagIds);
  const excluded = new Set(excludedIngredientIds);
  for (const item of recipe.ingredients) {
    if (excluded.has(item.ingredientId)) reasons.push({ kind: "EXCLUSION", ingredientId: item.ingredientId });
    for (const conflict of conflicts) {
      if (conflict.ingredientId === item.ingredientId && blocking.has(conflict.dietaryTagId)) {
        reasons.push({ kind: "TAG", ingredientId: item.ingredientId, tagId: conflict.dietaryTagId });
      }
    }
  }
  return reasons;
}

export function isRecipeCompatible(
  recipe: Pick<RecipeDetail, "ingredients">,
  conflicts: readonly IngredientDietConflict[],
  blockingTagIds: readonly ID[],
  excludedIngredientIds: readonly ID[],
): boolean {
  return incompatibilityReasons(recipe, conflicts, blockingTagIds, excludedIngredientIds).length === 0;
}

/** Hard tags (not preferences) the recipe is free of, e.g. "Vegetariana", "Sin gluten". */
export function suitableTags(
  recipe: Pick<RecipeDetail, "ingredients">,
  conflicts: readonly IngredientDietConflict[],
  tags: readonly DietaryTag[],
): DietaryTag[] {
  const ingredientIds = new Set(recipe.ingredients.map((item) => item.ingredientId));
  return tags.filter(
    (tag) =>
      tag.kind !== "PREFERENCE" &&
      !conflicts.some((conflict) => conflict.dietaryTagId === tag.id && ingredientIds.has(conflict.ingredientId)),
  );
}

export interface RecipeFilters {
  mealType?: MealType | undefined;
  maxMinutes?: number | undefined;
  ingredientId?: ID | undefined;
  foodGroup?: string | undefined;
  suitableForTagId?: ID | undefined;
  maxCost?: number | undefined;
  minCost?: number | undefined;
  query?: string | undefined;
}

export interface RecipeFilterContext {
  conflicts: readonly IngredientDietConflict[];
  costOf: (recipe: RecipeDetail) => number;
  ingredientsById: Map<ID, Ingredient>;
}

export function matchesFilters(recipe: RecipeDetail, filters: RecipeFilters, context: RecipeFilterContext): boolean {
  if (filters.mealType && !recipe.mealTypes.includes(filters.mealType)) return false;
  if (filters.maxMinutes !== undefined && recipe.prepMinutes > filters.maxMinutes) return false;
  if (filters.ingredientId && !recipe.ingredients.some((item) => item.ingredientId === filters.ingredientId)) return false;
  if (filters.foodGroup && !recipe.foodGroups.includes(filters.foodGroup)) return false;
  if (
    filters.suitableForTagId &&
    !isRecipeCompatible(recipe, context.conflicts, [filters.suitableForTagId], [])
  ) {
    return false;
  }
  if (filters.maxCost !== undefined || filters.minCost !== undefined) {
    const cost = context.costOf(recipe);
    if (filters.maxCost !== undefined && cost > filters.maxCost) return false;
    if (filters.minCost !== undefined && cost < filters.minCost) return false;
  }
  if (filters.query) {
    const needle = normalize(filters.query);
    const haystack = [
      recipe.name,
      recipe.description,
      ...recipe.ingredients.map((item) => context.ingredientsById.get(item.ingredientId)?.name ?? ""),
    ]
      .map(normalize)
      .join(" ");
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

/** Lowercase without accents, for search. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
