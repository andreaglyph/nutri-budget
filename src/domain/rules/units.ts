import type { BaseUnit, Unit } from "@/domain/models";

/**
 * Unit catalog. Quantities are always stored in the ingredient base unit
 * (g, ml, unit); presentation units convert with a fixed factor.
 * "lb" follows the Colombian market pound (500 g).
 */
export const UNITS: readonly Unit[] = [
  { code: "g", label: "g", baseUnit: "g", factorToBase: 1 },
  { code: "kg", label: "kg", baseUnit: "g", factorToBase: 1000 },
  { code: "lb", label: "lb (500 g)", baseUnit: "g", factorToBase: 500 },
  { code: "ml", label: "ml", baseUnit: "ml", factorToBase: 1 },
  { code: "l", label: "L", baseUnit: "ml", factorToBase: 1000 },
  { code: "unit", label: "unidades", baseUnit: "unit", factorToBase: 1 },
  { code: "docena", label: "docena", baseUnit: "unit", factorToBase: 12 },
];

export function unitsForBase(baseUnit: BaseUnit): Unit[] {
  return UNITS.filter((unit) => unit.baseUnit === baseUnit);
}

export function findUnit(code: string): Unit | undefined {
  return UNITS.find((unit) => unit.code === code);
}

/** Converts a quantity in a presentation unit to the ingredient base unit. */
export function toBaseQuantity(quantity: number, unitCode: string, baseUnit: BaseUnit): number {
  const unit = findUnit(unitCode);
  if (!unit) throw new Error(`Unidad desconocida: ${unitCode}`);
  if (unit.baseUnit !== baseUnit) {
    throw new Error(`La unidad ${unit.label} no es compatible con ${baseUnit}`);
  }
  return roundQuantity(quantity * unit.factorToBase);
}

/** Avoids floating point noise like 0.30000000000000004. */
export function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Spanish decimal formatting: 1.5 -> "1,5", 1500 -> "1.500". */
export function formatNumber(value: number, maxDecimals = 2): string {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: maxDecimals }).format(value);
}

/**
 * Human label for a base quantity: 1500 g -> "1,5 kg", 250 ml -> "250 ml",
 * 1 unit -> "1 unidad".
 */
export function formatQuantity(quantity: number, baseUnit: BaseUnit): string {
  if (baseUnit === "g") {
    return quantity >= 1000 ? `${formatNumber(quantity / 1000)} kg` : `${formatNumber(quantity, 0)} g`;
  }
  if (baseUnit === "ml") {
    return quantity >= 1000 ? `${formatNumber(quantity / 1000)} L` : `${formatNumber(quantity, 0)} ml`;
  }
  return `${formatNumber(quantity, 1)} ${quantity === 1 ? "unidad" : "unidades"}`;
}

export function baseUnitLabel(baseUnit: BaseUnit): string {
  return baseUnit === "unit" ? "unidades" : baseUnit;
}
