import type { BaseUnit, DietaryTag, Ingredient, IngredientDietConflict, IngredientPrice } from "@/domain/models";

/**
 * Demo ingredient catalog for Colombia. Prices are EXAMPLE ESTIMATES in COP per
 * base unit (g, ml or unit) — not verified supermarket quotes.
 */
export const PRICE_SOURCE = "Estimación de demostración";
export const PRICE_DATE = "2026-10-28";

type Row = [id: string, name: string, baseUnit: BaseUnit, category: string, foodGroup: string, pricePerBaseUnit: number];

const ROWS: Row[] = [
  // Granos, cereales y harinas
  ["ing_arroz", "Arroz blanco", "g", "Granos y cereales", "Cereales", 4.8],
  ["ing_harina_maiz", "Harina de maíz precocida", "g", "Granos y cereales", "Cereales", 5],
  ["ing_avena", "Avena en hojuelas", "g", "Granos y cereales", "Cereales", 9],
  ["ing_pasta", "Pasta espagueti", "g", "Granos y cereales", "Cereales", 8],
  ["ing_pan", "Pan tajado", "g", "Granos y cereales", "Cereales", 14],
  // Leguminosas
  ["ing_lentejas", "Lentejas", "g", "Granos y leguminosas", "Leguminosas", 8],
  ["ing_frijol", "Fríjol rojo", "g", "Granos y leguminosas", "Leguminosas", 12],
  ["ing_garbanzos", "Garbanzos", "g", "Granos y leguminosas", "Leguminosas", 9],
  ["ing_arveja", "Arveja verde", "g", "Verduras y hortalizas", "Leguminosas", 10],
  // Proteínas
  ["ing_pechuga", "Pechuga de pollo", "g", "Carnes y pescados", "Proteínas animales", 18],
  ["ing_muslos", "Muslos de pollo", "g", "Carnes y pescados", "Proteínas animales", 13],
  ["ing_tocineta", "Tocineta de cerdo", "g", "Carnes y pescados", "Proteínas animales", 28],
  ["ing_atun", "Atún en lata", "unit", "Carnes y pescados", "Proteínas animales", 6000],
  ["ing_camaron", "Camarón", "g", "Carnes y pescados", "Proteínas animales", 45],
  // Lácteos y huevos
  ["ing_huevo", "Huevo", "unit", "Lácteos y huevos", "Proteínas animales", 600],
  ["ing_leche", "Leche entera", "ml", "Lácteos y huevos", "Lácteos", 4.4],
  ["ing_queso", "Queso campesino", "g", "Lácteos y huevos", "Lácteos", 22],
  ["ing_mantequilla", "Mantequilla", "g", "Lácteos y huevos", "Grasas", 30],
  ["ing_crema", "Crema de leche", "ml", "Lácteos y huevos", "Lácteos", 14],
  // Tubérculos y plátanos
  ["ing_papa", "Papa pastusa", "g", "Tubérculos y plátanos", "Tubérculos", 3],
  ["ing_papa_criolla", "Papa criolla", "g", "Tubérculos y plátanos", "Tubérculos", 5],
  ["ing_yuca", "Yuca", "g", "Tubérculos y plátanos", "Tubérculos", 3],
  ["ing_platano_verde", "Plátano verde", "unit", "Tubérculos y plátanos", "Tubérculos", 1500],
  ["ing_platano_maduro", "Plátano maduro", "unit", "Tubérculos y plátanos", "Tubérculos", 1800],
  // Verduras
  ["ing_zanahoria", "Zanahoria", "g", "Verduras y hortalizas", "Verduras", 3],
  ["ing_cebolla", "Cebolla cabezona", "g", "Verduras y hortalizas", "Verduras", 3.5],
  ["ing_cebolla_larga", "Cebolla larga", "g", "Verduras y hortalizas", "Verduras", 4],
  ["ing_tomate", "Tomate chonto", "g", "Verduras y hortalizas", "Verduras", 4],
  ["ing_ajo", "Ajo", "g", "Verduras y hortalizas", "Verduras", 20],
  ["ing_pimenton", "Pimentón", "g", "Verduras y hortalizas", "Verduras", 8],
  ["ing_ahuyama", "Ahuyama", "g", "Verduras y hortalizas", "Verduras", 2.5],
  ["ing_habichuela", "Habichuela", "g", "Verduras y hortalizas", "Verduras", 6],
  ["ing_repollo", "Repollo", "g", "Verduras y hortalizas", "Verduras", 2.5],
  ["ing_espinaca", "Espinaca", "g", "Verduras y hortalizas", "Verduras", 12],
  ["ing_pepino", "Pepino", "g", "Verduras y hortalizas", "Verduras", 3],
  ["ing_lechuga", "Lechuga", "unit", "Verduras y hortalizas", "Verduras", 2500],
  ["ing_cilantro", "Cilantro", "g", "Verduras y hortalizas", "Verduras", 16],
  // Frutas
  ["ing_aguacate", "Aguacate", "unit", "Frutas", "Frutas", 3000],
  ["ing_limon", "Limón", "unit", "Frutas", "Frutas", 300],
  ["ing_banano", "Banano", "unit", "Frutas", "Frutas", 500],
  // Despensa
  ["ing_aceite", "Aceite vegetal", "ml", "Despensa", "Grasas", 9],
  ["ing_sal", "Sal", "g", "Despensa", "Condimentos", 1.5],
  ["ing_comino", "Comino molido", "g", "Despensa", "Condimentos", 60],
  ["ing_canela", "Canela en astilla", "g", "Despensa", "Condimentos", 40],
  ["ing_panela", "Panela", "g", "Despensa", "Azúcares", 6],
];

export const INGREDIENTS: readonly Ingredient[] = ROWS.map(([id, name, baseUnit, category, foodGroup]) => ({
  id,
  name,
  baseUnit,
  category,
  foodGroup,
  active: true,
}));

export const INGREDIENT_PRICES: readonly IngredientPrice[] = ROWS.map(([id, , , , , pricePerBaseUnit]) => ({
  id: `price_${id.slice(4)}`,
  ingredientId: id,
  pricePerBaseUnit,
  source: PRICE_SOURCE,
  updatedAt: PRICE_DATE,
}));

/**
 * Preferences, restrictions, allergies and intolerances are distinct kinds.
 * Only non-preference tags can make a recipe incompatible.
 */
export const DIETARY_TAGS: readonly DietaryTag[] = [
  { id: "tag_pref_rapidas", code: "QUICK", label: "Preparaciones rápidas", kind: "PREFERENCE" },
  { id: "tag_pref_vegetales", code: "MORE_VEGETABLES", label: "Más verduras", kind: "PREFERENCE" },
  { id: "tag_pref_tradicional", code: "TRADITIONAL", label: "Comida tradicional", kind: "PREFERENCE" },
  { id: "tag_pref_economica", code: "LOW_COST", label: "Opciones económicas", kind: "PREFERENCE" },
  { id: "tag_vegetariano", code: "VEGETARIAN", label: "Vegetariana", kind: "RESTRICTION" },
  { id: "tag_vegano", code: "VEGAN", label: "Vegana", kind: "RESTRICTION" },
  { id: "tag_sin_cerdo", code: "NO_PORK", label: "Sin cerdo", kind: "RESTRICTION" },
  { id: "tag_alergia_huevo", code: "EGG_ALLERGY", label: "Huevo", kind: "ALLERGY" },
  { id: "tag_alergia_leche", code: "MILK_ALLERGY", label: "Proteína de leche", kind: "ALLERGY" },
  { id: "tag_alergia_mani", code: "PEANUT_ALLERGY", label: "Maní", kind: "ALLERGY" },
  { id: "tag_alergia_mariscos", code: "SHELLFISH_ALLERGY", label: "Mariscos", kind: "ALLERGY" },
  { id: "tag_alergia_pescado", code: "FISH_ALLERGY", label: "Pescado", kind: "ALLERGY" },
  { id: "tag_intol_lactosa", code: "LACTOSE_INTOLERANCE", label: "Lactosa", kind: "INTOLERANCE" },
  { id: "tag_intol_gluten", code: "GLUTEN_INTOLERANCE", label: "Gluten", kind: "INTOLERANCE" },
];

/** Labels used when a hard tag describes a recipe ("Apta para…"). */
export const SUITABLE_LABELS: Record<string, string> = {
  tag_vegetariano: "Vegetariana",
  tag_vegano: "Vegana",
  tag_sin_cerdo: "Sin cerdo",
  tag_alergia_huevo: "Sin huevo",
  tag_alergia_leche: "Sin leche",
  tag_alergia_mani: "Sin maní",
  tag_alergia_mariscos: "Sin mariscos",
  tag_alergia_pescado: "Sin pescado",
  tag_intol_lactosa: "Sin lactosa",
  tag_intol_gluten: "Sin gluten",
};

const conflict = (dietaryTagId: string, ingredientIds: string[]): IngredientDietConflict[] =>
  ingredientIds.map((ingredientId) => ({ ingredientId, dietaryTagId }));

const MEATS = ["ing_pechuga", "ing_muslos", "ing_tocineta", "ing_atun", "ing_camaron"];
const DAIRY = ["ing_leche", "ing_queso", "ing_mantequilla", "ing_crema"];

export const INGREDIENT_DIET_CONFLICTS: readonly IngredientDietConflict[] = [
  ...conflict("tag_vegetariano", MEATS),
  ...conflict("tag_vegano", [...MEATS, ...DAIRY, "ing_huevo"]),
  ...conflict("tag_sin_cerdo", ["ing_tocineta"]),
  ...conflict("tag_alergia_huevo", ["ing_huevo"]),
  ...conflict("tag_alergia_leche", DAIRY),
  ...conflict("tag_alergia_mariscos", ["ing_camaron"]),
  ...conflict("tag_alergia_pescado", ["ing_atun"]),
  ...conflict("tag_intol_lactosa", DAIRY),
  // Oats are often cross-contaminated with gluten in local brands.
  ...conflict("tag_intol_gluten", ["ing_pasta", "ing_pan", "ing_avena"]),
];
