import { describe, expect, it } from "vitest";
import { indexCatalog } from "./catalog";
import { latestPrices, matchesFilters, recipeCost } from "./recipes";
import { catalogService } from "@/services/catalog.service";

describe("recetario", () => {
  it("calcula costos totales y por porción sin confundirlos con gasto real", () => {
    const prices = latestPrices([{ id: "p", ingredientId: "rice", pricePerBaseUnit: 5, source: "Demo", updatedAt: "2026-11-09" }]);
    expect(recipeCost({ servings: 2, ingredients: [{ recipeId: "r", ingredientId: "rice", quantity: 200 }] }, 3, prices)).toEqual({ total: 1500, perServing: 500, missingPrices: [] });
  });
  it("usa el precio más reciente y reporta precios faltantes", () => {
    const prices = latestPrices([{ id: "old", ingredientId: "rice", pricePerBaseUnit: 2, source: "Demo", updatedAt: "2026-11-01" }, { id: "new", ingredientId: "rice", pricePerBaseUnit: 5, source: "Demo", updatedAt: "2026-11-09" }]);
    expect(prices.get("rice")?.pricePerBaseUnit).toBe(5);
    expect(recipeCost({ servings: 1, ingredients: [{ recipeId: "r", ingredientId: "missing", quantity: 1 }] }, 1, prices).missingPrices).toEqual(["missing"]);
  });
  it("aplica comida, tiempo, ingredientes, grupo, compatibilidad y costo", async () => {
    const catalog = await catalogService.getCatalog();
    const index = indexCatalog(catalog);
    const recipe = index.recipesById.get("rec_arepa_huevo");
    if (!recipe) throw new Error("Missing fixture");
    const context = { conflicts: catalog.conflicts, ingredientsById: index.ingredientsById, costOf: () => 5000 };
    expect(matchesFilters(recipe, { query: "AREPA", mealType: "BREAKFAST", maxCost: 5000 }, context)).toBe(true);
    expect(matchesFilters(recipe, { maxCost: 4999 }, context)).toBe(false);
    expect(matchesFilters(recipe, { maxMinutes: recipe.prepMinutes - 1 }, context)).toBe(false);
    expect(matchesFilters(recipe, { ingredientId: "not-an-ingredient" }, context)).toBe(false);
    expect(matchesFilters(recipe, { foodGroup: "not-a-group" }, context)).toBe(false);
    expect(matchesFilters(recipe, { suitableForTagId: "tag_alergia_huevo" }, context)).toBe(false);
  });
});
