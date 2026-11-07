import type {
  Budget,
  DietarySelection,
  ID,
  ISODate,
  Purchase,
  PurchaseItem,
  User,
  UserInventory,
  UserProfile,
} from "@/domain/models";
import { addDays, mondayOf } from "@/domain/rules/dates";
import { weeklyEndDate } from "@/domain/rules/budget";

import { DEMO_ACCOUNTS } from "./users";

export interface StoredCredential {
  userId: ID;
  email: string;
  /** Prototype only: simulated credentials kept in the browser, never real data. */
  password: string;
}

export interface UserDietaryRecord extends DietarySelection {
  userId: ID;
}

/** Shape of the simulated database persisted in the browser. */
export interface DemoDatabase {
  version: 1;
  seededOn: ISODate;
  users: User[];
  credentials: StoredCredential[];
  profiles: UserProfile[];
  dietary: UserDietaryRecord[];
  budgets: Budget[];
  inventory: UserInventory[];
  purchases: Purchase[];
  purchaseItems: PurchaseItem[];
}

const LAURA = "usr_laura";

/**
 * Builds the demo dataset relative to `today` so expiry dates and the current
 * weekly budget always make sense, whatever day the prototype is opened.
 */
export function buildDemoSeed(today: ISODate): DemoDatabase {
  const createdAt = `${addDays(today, -28)}T09:00:00.000Z`;
  const users: User[] = DEMO_ACCOUNTS.map((account) => ({
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    termsAcceptedAt: createdAt,
    dataProcessingAcceptedAt: createdAt,
    createdAt,
  }));
  const credentials: StoredCredential[] = DEMO_ACCOUNTS.map((account) => ({
    userId: account.id,
    email: account.email,
    password: account.password,
  }));

  const profiles: UserProfile[] = [
    { userId: LAURA, householdSize: 2, plannedMealTypes: ["BREAKFAST", "LUNCH", "DINNER"], onboardingCompleted: true },
    { userId: "usr_admin", householdSize: 1, plannedMealTypes: ["LUNCH", "DINNER"], onboardingCompleted: true },
  ];

  const dietary: UserDietaryRecord[] = [
    {
      userId: LAURA,
      preferenceTagIds: ["tag_pref_tradicional", "tag_pref_economica"],
      restrictionTagIds: [],
      allergyTagIds: ["tag_alergia_mariscos"],
      excludedIngredientIds: ["ing_tocineta"],
    },
    { userId: "usr_admin", preferenceTagIds: [], restrictionTagIds: [], allergyTagIds: [], excludedIngredientIds: [] },
  ];

  // Current week + three past weeks for Laura.
  const monday = mondayOf(today);
  const weeks: Array<{ offset: number; amount: number }> = [
    { offset: 0, amount: 150000 },
    { offset: -1, amount: 150000 },
    { offset: -2, amount: 140000 },
    { offset: -3, amount: 150000 },
  ];
  const budgets: Budget[] = weeks.map(({ offset, amount }) => {
    const startDate = addDays(monday, offset * 7);
    return { id: `bud_laura_w${-offset}`, userId: LAURA, amount, period: "WEEKLY", startDate, endDate: weeklyEndDate(startDate) };
  });

  // Purchases: line totals are the real amounts paid.
  type Line = [ingredientId: ID, quantity: number, lineTotal: number];
  const purchaseRows: Array<{ id: string; budgetId: string; dayOffset: number; lines: Line[] }> = [
    {
      id: "pur_w0_a",
      budgetId: "bud_laura_w0",
      dayOffset: 0,
      lines: [["ing_pechuga", 1000, 17900], ["ing_huevo", 12, 7200], ["ing_tomate", 1000, 4100], ["ing_leche", 1100, 4900], ["ing_papa", 2000, 5800]],
    },
    {
      id: "pur_w0_b",
      budgetId: "bud_laura_w0",
      dayOffset: 2,
      lines: [["ing_lentejas", 500, 4200], ["ing_queso", 250, 5900], ["ing_cebolla", 500, 1900], ["ing_zanahoria", 500, 1600], ["ing_arroz", 2500, 11600]],
    },
    { id: "pur_w1", budgetId: "bud_laura_w1", dayOffset: -6, lines: [["ing_muslos", 2000, 26500], ["ing_arroz", 5000, 23400], ["ing_frijol", 1000, 12300], ["ing_huevo", 30, 17500], ["ing_platano_verde", 6, 8800], ["ing_leche", 4400, 19300], ["ing_ahuyama", 1500, 3900], ["ing_aceite", 1000, 9200], ["ing_queso", 500, 11400]] },
    { id: "pur_w2", budgetId: "bud_laura_w2", dayOffset: -13, lines: [["ing_pechuga", 2000, 36400], ["ing_pasta", 1000, 8100], ["ing_garbanzos", 1000, 9300], ["ing_huevo", 30, 18200], ["ing_leche", 4400, 19800], ["ing_aguacate", 4, 12600], ["ing_papa", 3000, 9100], ["ing_avena", 1000, 9400], ["ing_queso", 1000, 22300], ["ing_cebolla", 1000, 3700]] },
    { id: "pur_w3", budgetId: "bud_laura_w3", dayOffset: -20, lines: [["ing_muslos", 2000, 26100], ["ing_lentejas", 1000, 8200], ["ing_arroz", 5000, 23600], ["ing_huevo", 30, 17900], ["ing_leche", 3300, 14600], ["ing_yuca", 2000, 6100], ["ing_tomate", 1500, 6200], ["ing_harina_maiz", 1000, 5200], ["ing_queso", 500, 11000]] },
  ];
  const purchases: Purchase[] = [];
  const purchaseItems: PurchaseItem[] = [];
  for (const row of purchaseRows) {
    const total = row.lines.reduce((sum, [, , lineTotal]) => sum + lineTotal, 0);
    purchases.push({ id: row.id, userId: LAURA, budgetId: row.budgetId, shoppingListId: null, date: addDays(monday, row.dayOffset), total });
    row.lines.forEach(([ingredientId, quantity, lineTotal], index) => {
      purchaseItems.push({ id: `${row.id}_l${index}`, purchaseId: row.id, ingredientId, shoppingListItemId: null, quantity, lineTotal });
    });
  }

  // Inventory batches (several per ingredient allowed). Offsets are days from today.
  type Batch = [id: string, ingredientId: ID, quantity: number, bestBeforeOffset: number | null, registeredOffset: number];
  const batches: Batch[] = [
    ["inv_arroz", "ing_arroz", 2000, 120, -5],
    ["inv_huevo_a", "ing_huevo", 4, 2, -9],
    ["inv_huevo_b", "ing_huevo", 12, 16, -1],
    ["inv_leche", "ing_leche", 1000, 2, -4],
    ["inv_tomate", "ing_tomate", 500, 1, -4],
    ["inv_pechuga", "ing_pechuga", 600, 1, -3],
    ["inv_cebolla", "ing_cebolla", 750, 10, -4],
    ["inv_papa", "ing_papa", 1500, 12, -4],
    ["inv_lentejas", "ing_lentejas", 500, 200, -2],
    ["inv_queso", "ing_queso", 120, -1, -12],
    ["inv_aceite", "ing_aceite", 900, null, -20],
    ["inv_zanahoria", "ing_zanahoria", 0, 8, -6],
  ];
  const inventory: UserInventory[] = batches.map(([id, ingredientId, quantity, bestBeforeOffset, registeredOffset]) => ({
    id,
    userId: LAURA,
    ingredientId,
    quantity,
    bestBefore: bestBeforeOffset === null ? null : addDays(today, bestBeforeOffset),
    registeredAt: `${addDays(today, registeredOffset)}T12:00:00.000Z`,
  }));

  return { version: 1, seededOn: today, users, credentials, profiles, dietary, budgets, inventory, purchases, purchaseItems };
}
