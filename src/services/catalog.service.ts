import type { Catalog } from "@/domain/models";
import { UNITS } from "@/domain/rules/units";
import { DIETARY_TAGS, INGREDIENT_DIET_CONFLICTS, INGREDIENT_PRICES, INGREDIENTS } from "@/mocks/catalog";
import { RECIPES } from "@/mocks/recipes";

import { simulateLatency } from "./simulated-api";

/** Mirrors GET /api/catalog (ingredients, units, prices, tags, conflicts, recipes). */
export const catalogService = {
  async getCatalog(): Promise<Catalog> {
    await simulateLatency(250);
    return {
      ingredients: INGREDIENTS.filter((ingredient) => ingredient.active),
      units: [...UNITS],
      prices: [...INGREDIENT_PRICES],
      dietaryTags: [...DIETARY_TAGS],
      conflicts: [...INGREDIENT_DIET_CONFLICTS],
      recipes: RECIPES.filter((recipe) => recipe.active),
    };
  },
};
