import type { Catalog, DietaryTag, ID, Ingredient, IngredientPrice, RecipeDetail } from "@/domain/models";

import { latestPrices } from "./recipes";

export interface CatalogIndex {
  ingredientsById: Map<ID, Ingredient>;
  pricesByIngredient: Map<ID, IngredientPrice>;
  tagsById: Map<ID, DietaryTag>;
  recipesById: Map<ID, RecipeDetail>;
  categories: string[];
  foodGroups: string[];
}

export function indexCatalog(catalog: Catalog): CatalogIndex {
  return {
    ingredientsById: new Map(catalog.ingredients.map((ingredient) => [ingredient.id, ingredient])),
    pricesByIngredient: latestPrices(catalog.prices),
    tagsById: new Map(catalog.dietaryTags.map((tag) => [tag.id, tag])),
    recipesById: new Map(catalog.recipes.map((recipe) => [recipe.id, recipe])),
    categories: [...new Set(catalog.ingredients.map((ingredient) => ingredient.category))].sort((a, b) => a.localeCompare(b, "es")),
    foodGroups: [...new Set(catalog.recipes.flatMap((recipe) => recipe.foodGroups))].sort((a, b) => a.localeCompare(b, "es")),
  };
}
