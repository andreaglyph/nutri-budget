/**
 * Domain models mirroring the NutriBudget logical data model (SRS v1.0 + audit).
 * Identifiers in English; UI copy in Spanish. These types are framework-agnostic
 * so they can be ported to Angular interfaces and Java/JPA entities.
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string;

/* ---------- Users ---------- */
export type UserRole = "USER" | "ADMIN";

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  termsAcceptedAt: ISODateTime | null;
  dataProcessingAcceptedAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";

export interface UserProfile {
  userId: ID;
  householdSize: number;
  plannedMealTypes: MealType[];
  onboardingCompleted: boolean;
}

/* ---------- Dietary tags (preferences, restrictions, allergies are distinct kinds) ---------- */
export type DietaryTagKind = "PREFERENCE" | "RESTRICTION" | "ALLERGY" | "INTOLERANCE";

export interface DietaryTag {
  id: ID;
  code: string;
  label: string;
  kind: DietaryTagKind;
}

/** Hard rule: links RESTRICTION, ALLERGY or INTOLERANCE tags. Excludes recipes. */
export interface UserDietaryRestriction {
  userId: ID;
  dietaryTagId: ID;
}

/**
 * Soft rule: links PREFERENCE tags. Guides the menu but never excludes recipes.
 * Provisional mapping — the SRS entity list may model preferences differently.
 */
export interface UserDietaryPreference {
  userId: ID;
  dietaryTagId: ID;
}

/** Voluntary exclusion — not a medical restriction. */
export interface UserExcludedIngredient {
  userId: ID;
  ingredientId: ID;
}

export interface IngredientDietConflict {
  ingredientId: ID;
  dietaryTagId: ID;
}

/* ---------- Ingredients, units, prices ---------- */
export type BaseUnit = "g" | "ml" | "unit";

export interface Unit {
  code: string; // g, kg, ml, l, unit, docena...
  label: string;
  baseUnit: BaseUnit;
  factorToBase: number; // kg -> 1000
}

export interface Ingredient {
  id: ID;
  name: string;
  baseUnit: BaseUnit;
  category: string;
  foodGroup: string;
  active: boolean;
}

export interface IngredientPrice {
  id: ID;
  ingredientId: ID;
  pricePerBaseUnit: number; // COP
  source: string;
  updatedAt: ISODate;
}

/** Defined for completeness; ingredient substitution is deferred (pending decision). */
export interface IngredientSubstitution {
  ingredientId: ID;
  substituteIngredientId: ID;
  ratio: number;
}

/** One inventory batch. Several batches per ingredient are allowed. */
export interface UserInventory {
  id: ID;
  userId: ID;
  ingredientId: ID;
  quantity: number; // in ingredient base unit
  bestBefore: ISODate | null;
  registeredAt: ISODateTime;
}

/* ---------- Recipes ---------- */
export interface Recipe {
  id: ID;
  name: string;
  description: string;
  imageUrl: string;
  prepMinutes: number;
  servings: number;
  steps: string[];
  foodGroups: string[];
  active: boolean;
}

export interface RecipeMealType {
  recipeId: ID;
  mealType: MealType;
}

export interface RecipeIngredient {
  recipeId: ID;
  ingredientId: ID;
  quantity: number; // base unit, for recipe.servings
}

/* ---------- Budgets & plans ---------- */
export interface Budget {
  id: ID;
  userId: ID;
  amount: number; // COP, > 0
  period: "WEEKLY";
  startDate: ISODate;
  endDate: ISODate;
}

export type MealPlanStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type MealPlanItemStatus = "PLANNED" | "COOKED" | "SKIPPED";

export interface MealPlan {
  id: ID;
  userId: ID;
  budgetId: ID;
  weekStart: ISODate;
  householdSize: number;
  status: MealPlanStatus;
  /** Frozen at generation time so history survives catalog price changes. */
  estimatedRecipesCost: number;
  estimatedInventoryValue: number;
  estimatedPurchaseCost: number;
  createdAt: ISODateTime;
}

export interface MealPlanItem {
  id: ID;
  mealPlanId: ID;
  recipeId: ID;
  date: ISODate;
  mealType: MealType;
  servings: number;
  status: MealPlanItemStatus;
  frozenRecipeName: string;
  frozenEstimatedCost: number;
}

/** Deferred — kept as a separate table per audit. */
export interface MealPlanItemSubstitution {
  mealPlanItemId: ID;
  originalIngredientId: ID;
  substituteIngredientId: ID;
}

/* ---------- Shopping ---------- */
export type ShoppingListStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ShoppingList {
  id: ID;
  mealPlanId: ID; // unique: one list per meal plan
  status: ShoppingListStatus;
  createdAt: ISODateTime;
}

export interface ShoppingListItem {
  id: ID;
  shoppingListId: ID;
  ingredientId: ID;
  requiredQuantity: number;
  availableQuantity: number;
  missingQuantity: number;
  estimatedUnitPrice: number;
  estimatedSubtotal: number;
  checked: boolean; // "marked" — not the same as a registered purchase
}

export interface Purchase {
  id: ID;
  userId: ID;
  budgetId: ID;
  shoppingListId: ID | null;
  date: ISODate;
  total: number;
}

export interface PurchaseItem {
  id: ID;
  purchaseId: ID;
  ingredientId: ID;
  shoppingListItemId: ID | null;
  quantity: number; // base unit, may exceed need (commercial packages)
  lineTotal: number; // real amount paid
}

/* ---------- Aggregates returned by services (DTO-like) ---------- */
export interface RecipeDetail extends Recipe {
  mealTypes: MealType[];
  ingredients: RecipeIngredient[];
}

export interface Catalog {
  ingredients: Ingredient[];
  units: Unit[];
  prices: IngredientPrice[];
  dietaryTags: DietaryTag[];
  conflicts: IngredientDietConflict[];
  recipes: RecipeDetail[];
}

export interface DietarySelection {
  preferenceTagIds: ID[];
  restrictionTagIds: ID[]; // RESTRICTION
  allergyTagIds: ID[]; // ALLERGY + INTOLERANCE
  excludedIngredientIds: ID[];
}

export interface ProfileDetails extends DietarySelection {
  user: User;
  profile: UserProfile;
}

/* ---------- Session (prototype only) ---------- */
export interface Session {
  userId: ID;
  name: string;
  email: string;
  role: UserRole;
  onboardingCompleted: boolean;
  startedAt: ISODateTime;
}
