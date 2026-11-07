import { describe, expect, it } from "vitest";

import type { Budget, UserInventory } from "@/domain/models";
import { INGREDIENT_DIET_CONFLICTS } from "@/mocks/catalog";
import { RECIPES } from "@/mocks/recipes";

import { budgetTimeline, spentForBudget, summarizeBudget, validateBudget, weeklyEndDate } from "./budget";
import { batchStatus, groupBatchesByIngredient, sortByBestBefore, usableQuantityByIngredient, validateBatchInput } from "./inventory";
import { blockingTagIds, validateProfile } from "./profile";
import { isRecipeCompatible, scaleQuantity } from "./recipes";
import { toBaseQuantity } from "./units";

const budget = (id: string, startDate: string): Budget => ({
  id,
  userId: "u",
  amount: 150000,
  period: "WEEKLY",
  startDate,
  endDate: weeklyEndDate(startDate),
});

const batch = (id: string, quantity: number, bestBefore: string | null, registeredAt = "2026-11-01T10:00:00Z"): UserInventory => ({
  id,
  userId: "u",
  ingredientId: "ing_huevo",
  quantity,
  bestBefore,
  registeredAt,
});

describe("presupuesto semanal", () => {
  it("dura 7 días: inicio lunes 2 nov termina domingo 8 nov", () => {
    expect(weeklyEndDate("2026-11-02")).toBe("2026-11-08");
  });

  it("rechaza valores de 0 o negativos", () => {
    expect(validateBudget({ amount: 0, startDate: "2026-11-02" }, [])).toBe("AMOUNT_NOT_POSITIVE");
    expect(validateBudget({ amount: -5000, startDate: "2026-11-02" }, [])).toBe("AMOUNT_NOT_POSITIVE");
  });

  it("rechaza presupuestos que se cruzan en fechas", () => {
    const existing = [budget("a", "2026-11-02")];
    expect(validateBudget({ amount: 150000, startDate: "2026-11-05" }, existing)).toBe("OVERLAP");
    expect(validateBudget({ amount: 150000, startDate: "2026-11-09" }, existing)).toBeNull();
  });

  it("permite editar un presupuesto sin chocar consigo mismo", () => {
    const existing = [budget("a", "2026-11-02")];
    expect(validateBudget({ amount: 120000, startDate: "2026-11-02" }, existing, "a")).toBeNull();
  });

  it("calcula saldo, porcentaje y estado con el gasto real", () => {
    expect(summarizeBudget(150000, 59800)).toMatchObject({ balance: 90200, percentUsed: 39.9, status: "WITHIN" });
    expect(summarizeBudget(150000, 130000).status).toBe("NEAR_LIMIT");
    expect(summarizeBudget(150000, 151200)).toMatchObject({ balance: -1200, status: "OVER" });
  });

  it("suma solo las compras del presupuesto indicado", () => {
    const purchases = [
      { budgetId: "a", total: 38500 },
      { budgetId: "a", total: 21300 },
      { budgetId: "b", total: 99000 },
    ];
    expect(spentForBudget(purchases, "a")).toBe(59800);
  });

  it("clasifica presupuestos actuales, próximos y pasados", () => {
    const current = budget("a", "2026-11-02");
    expect(budgetTimeline(current, "2026-11-08")).toBe("CURRENT");
    expect(budgetTimeline(current, "2026-11-09")).toBe("PAST");
    expect(budgetTimeline(current, "2026-11-01")).toBe("UPCOMING");
  });
});

describe("inventario por lotes", () => {
  it("ordena primero lo que vence antes y deja al final los lotes sin fecha", () => {
    const ordered = sortByBestBefore([batch("sin", 1, null), batch("tarde", 1, "2026-11-20"), batch("pronto", 1, "2026-11-08")]);
    expect(ordered.map((item) => item.id)).toEqual(["pronto", "tarde", "sin"]);
  });

  it("marca por consumir pronto a 3 días o menos, vencido y agotado", () => {
    expect(batchStatus(batch("a", 2, "2026-11-10"), "2026-11-07")).toBe("EXPIRING");
    expect(batchStatus(batch("a", 2, "2026-11-11"), "2026-11-07")).toBe("AVAILABLE");
    expect(batchStatus(batch("a", 2, "2026-11-06"), "2026-11-07")).toBe("EXPIRED");
    expect(batchStatus(batch("a", 0, "2026-11-20"), "2026-11-07")).toBe("DEPLETED");
  });

  it("no cuenta lotes vencidos ni agotados como disponibles", () => {
    const totals = usableQuantityByIngredient(
      [batch("a", 4, "2026-11-09"), batch("b", 12, "2026-11-20"), batch("c", 6, "2026-11-01"), batch("d", 0, null)],
      "2026-11-07",
    );
    expect(totals.get("ing_huevo")).toBe(16);
  });

  it("agrupa varios lotes del mismo ingrediente en orden de vencimiento", () => {
    const [group] = groupBatchesByIngredient([batch("b", 12, "2026-11-20"), batch("a", 4, "2026-11-09")], "2026-11-07");
    expect(group?.batches.map((item) => item.id)).toEqual(["a", "b"]);
    expect(group?.usableQuantity).toBe(16);
    expect(group?.nearestBestBefore).toBe("2026-11-09");
  });

  it("valida cantidad positiva y unidad compatible", () => {
    const base = { ingredientId: "ing_arroz", quantity: 1, unitCode: "kg", bestBefore: null };
    expect(validateBatchInput(base, "g", "g")).toBeNull();
    expect(validateBatchInput({ ...base, quantity: 0 }, "g", "g")).toBe("QUANTITY_NOT_POSITIVE");
    expect(validateBatchInput({ ...base, unitCode: "ml" }, "g", "ml")).toBe("UNIT_INCOMPATIBLE");
  });
});

describe("unidades", () => {
  it("convierte kg, libra colombiana (500 g) y docena a la unidad base", () => {
    expect(toBaseQuantity(1.5, "kg", "g")).toBe(1500);
    expect(toBaseQuantity(2, "lb", "g")).toBe(1000);
    expect(toBaseQuantity(1, "docena", "unit")).toBe(12);
  });
});

describe("perfil y compatibilidad de recetas", () => {
  const arepa = RECIPES.find((recipe) => recipe.id === "rec_arepa_huevo")!;

  it("una alergia al huevo excluye la arepa con huevo", () => {
    const blocking = blockingTagIds({ preferenceTagIds: [], restrictionTagIds: [], allergyTagIds: ["tag_alergia_huevo"], excludedIngredientIds: [] });
    expect(isRecipeCompatible(arepa, INGREDIENT_DIET_CONFLICTS, blocking, [])).toBe(false);
  });

  it("las preferencias nunca excluyen recetas", () => {
    const blocking = blockingTagIds({ preferenceTagIds: ["tag_pref_rapidas", "tag_pref_vegetales"], restrictionTagIds: [], allergyTagIds: [], excludedIngredientIds: [] });
    expect(blocking).toEqual([]);
    expect(isRecipeCompatible(arepa, INGREDIENT_DIET_CONFLICTS, blocking, [])).toBe(true);
  });

  it("excluir un ingrediente voluntariamente excluye las recetas que lo usan", () => {
    expect(isRecipeCompatible(arepa, INGREDIENT_DIET_CONFLICTS, [], ["ing_queso"])).toBe(false);
  });

  it("escala cantidades por número de personas", () => {
    expect(scaleQuantity(150, 2, 3)).toBe(225);
  });

  it("exige al menos una comida y entre 1 y 12 personas", () => {
    expect(validateProfile({ name: "Laura", householdSize: 2, plannedMealTypes: [] })).toBe("MEALS_REQUIRED");
    expect(validateProfile({ name: "Laura", householdSize: 0, plannedMealTypes: ["LUNCH"] })).toBe("HOUSEHOLD_RANGE");
    expect(validateProfile({ name: "Laura", householdSize: 2, plannedMealTypes: ["LUNCH"] })).toBeNull();
  });
});
