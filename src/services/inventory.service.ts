import type { ID, UserInventory } from "@/domain/models";
import { BATCH_ERROR_MESSAGES, validateBatchInput, type BatchInput } from "@/domain/rules/inventory";
import { findUnit, toBaseQuantity } from "@/domain/rules/units";
import { INGREDIENTS } from "@/mocks/catalog";

import { newId, readDb, updateDb } from "./db";
import { ApiError, simulateLatency } from "./simulated-api";

export type NewBatch = BatchInput;

/** Validates and converts a batch to the ingredient base unit. */
function toBaseBatch(input: NewBatch) {
  const ingredient = INGREDIENTS.find((candidate) => candidate.id === input.ingredientId);
  const error = validateBatchInput(input, ingredient?.baseUnit, findUnit(input.unitCode)?.baseUnit);
  if (error || !ingredient) {
    const code = error ?? "INGREDIENT_REQUIRED";
    throw new ApiError(code, BATCH_ERROR_MESSAGES[code]);
  }
  return { ingredientId: ingredient.id, quantity: toBaseQuantity(input.quantity, input.unitCode, ingredient.baseUnit), bestBefore: input.bestBefore };
}

export function buildBatch(userId: ID, input: NewBatch): UserInventory {
  return { id: newId("inv"), userId, registeredAt: new Date().toISOString(), ...toBaseBatch(input) };
}

function findOwned(batches: UserInventory[], userId: ID, id: ID): UserInventory {
  const batch = batches.find((candidate) => candidate.id === id && candidate.userId === userId);
  if (!batch) throw new ApiError("NOT_FOUND", "Este lote ya no existe.");
  return batch;
}

/** Mirrors /api/users/me/inventory. One record per batch. */
export const inventoryService = {
  async list(userId: ID): Promise<UserInventory[]> {
    await simulateLatency(250);
    return readDb().inventory.filter((batch) => batch.userId === userId);
  },

  async add(userId: ID, input: NewBatch): Promise<UserInventory> {
    await simulateLatency();
    const batch = buildBatch(userId, input);
    updateDb((db) => db.inventory.push(batch));
    return batch;
  },

  async update(userId: ID, id: ID, input: NewBatch): Promise<void> {
    await simulateLatency();
    const values = toBaseBatch(input);
    updateDb((db) => Object.assign(findOwned(db.inventory, userId, id), values));
  },

  async markDepleted(userId: ID, id: ID): Promise<void> {
    await simulateLatency(300);
    updateDb((db) => {
      findOwned(db.inventory, userId, id).quantity = 0;
    });
  },

  async remove(userId: ID, id: ID): Promise<void> {
    await simulateLatency(300);
    updateDb((db) => {
      findOwned(db.inventory, userId, id);
      db.inventory = db.inventory.filter((batch) => batch.id !== id);
    });
  },
};
