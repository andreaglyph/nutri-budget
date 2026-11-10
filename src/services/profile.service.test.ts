import { beforeEach, describe, expect, it } from "vitest";
import { authService } from "./auth.service";
import { profileService } from "./profile.service";
import { readDb, resetDb } from "./db";

beforeEach(() => { window.localStorage.clear(); authService.logout(); resetDb(); });
describe("datos de cuenta simulados", () => {
  it("guarda preferencias, restricciones, alergias y exclusiones por separado", async () => {
    const session = await authService.loginAsDemo("USER");
    await profileService.updateProfile(session.userId, { name: "Laura prueba", householdSize: 3, plannedMealTypes: ["LUNCH"], preferenceTagIds: ["tag_pref_rapidas"], restrictionTagIds: ["tag_vegetariano"], allergyTagIds: ["tag_alergia_huevo"], excludedIngredientIds: ["ing_queso"] });
    const details = await profileService.getProfile(session.userId);
    expect(details.profile.householdSize).toBe(3);
    expect(details.preferenceTagIds).toEqual(["tag_pref_rapidas"]);
    expect(details.restrictionTagIds).toEqual(["tag_vegetariano"]);
    expect(details.allergyTagIds).toEqual(["tag_alergia_huevo"]);
    expect(details.excludedIngredientIds).toEqual(["ing_queso"]);
  });
  it("elimina todos los datos de la cuenta sin eliminar otras cuentas", async () => {
    const session = await authService.loginAsDemo("USER");
    const otherUsers = readDb().users.filter(u => u.id !== session.userId).map(u => u.id);
    const purchaseIds = readDb().purchases.filter(p => p.userId === session.userId).map(p => p.id);
    await profileService.deleteAccount(session.userId);
    const db = readDb();
    expect(db.users.map(u => u.id)).toEqual(otherUsers);
    for (const rows of [db.credentials, db.profiles, db.dietary, db.budgets, db.inventory, db.purchases]) expect(rows.some(r => r.userId === session.userId)).toBe(false);
    expect(db.purchaseItems.some(p => purchaseIds.includes(p.purchaseId))).toBe(false);
    await expect(profileService.getProfile(session.userId)).rejects.toThrow("No encontramos tu perfil");
  });
});
