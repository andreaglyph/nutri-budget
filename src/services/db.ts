import { todayISO } from "@/domain/rules/dates";
import { buildDemoSeed, type DemoDatabase } from "@/mocks/demo-seed";

import { ApiError, isBrowser } from "./simulated-api";

/**
 * Simulated database persisted in localStorage. Only services may use it —
 * components go through services so they can later switch to real HTTP calls.
 */
const DB_KEY = "nb.db.v1";

function load(): DemoDatabase {
  if (!isBrowser()) throw new ApiError("UNAVAILABLE", "Los datos de demostración solo están disponibles en el navegador.");
  const raw = window.localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DemoDatabase;
      if (parsed.version === 1) return parsed;
    } catch {
      // Corrupt data: fall through and reseed.
    }
  }
  const seed = buildDemoSeed(todayISO());
  window.localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

export function readDb(): DemoDatabase {
  return load();
}

/** Applies a mutation on a copy and persists it atomically. */
export function updateDb<T>(mutate: (db: DemoDatabase) => T): T {
  const draft = structuredClone(load());
  const result = mutate(draft);
  window.localStorage.setItem(DB_KEY, JSON.stringify(draft));
  return result;
}

/** Restores the original demo dataset (all local changes are lost). */
export function resetDb(): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(buildDemoSeed(todayISO())));
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
