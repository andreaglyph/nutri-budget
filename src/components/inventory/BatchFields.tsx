import { FieldError } from "@/components/common/FieldError";
import { IngredientPicker } from "@/components/common/IngredientPicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ingredient, UserInventory } from "@/domain/models";
import type { BatchInput } from "@/domain/rules/inventory";
import { unitsForBase } from "@/domain/rules/units";

export interface BatchDraft {
  ingredientId: string;
  quantity: string;
  unitCode: string;
  bestBefore: string;
}

export const EMPTY_BATCH: BatchDraft = { ingredientId: "", quantity: "", unitCode: "", bestBefore: "" };

export function draftFromBatch(batch: UserInventory, ingredient: Ingredient | undefined): BatchDraft {
  return {
    ingredientId: batch.ingredientId,
    quantity: String(batch.quantity),
    unitCode: ingredient?.baseUnit ?? "g",
    bestBefore: batch.bestBefore ?? "",
  };
}

export function draftToInput(draft: BatchDraft): BatchInput {
  return {
    ingredientId: draft.ingredientId,
    quantity: Number(draft.quantity.replace(",", ".")),
    unitCode: draft.unitCode,
    bestBefore: draft.bestBefore || null,
  };
}

interface BatchFieldsProps {
  idPrefix: string;
  value: BatchDraft;
  onChange: (next: BatchDraft) => void;
  ingredients: readonly Ingredient[];
  error?: string | null | undefined;
  lockIngredient?: boolean;
}

export function BatchFields({ idPrefix, value, onChange, ingredients, error, lockIngredient }: BatchFieldsProps) {
  const ingredient = ingredients.find((candidate) => candidate.id === value.ingredientId);
  const units = ingredient ? unitsForBase(ingredient.baseUnit) : [];
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-ingredient`}>Ingrediente</Label>
        {lockIngredient && ingredient ? (
          <p id={`${idPrefix}-ingredient`} className="rounded-lg bg-surface-sunken px-3 py-2.5 text-sm font-medium text-foreground">
            {ingredient.name}
          </p>
        ) : (
          <IngredientPicker
            id={`${idPrefix}-ingredient`}
            ingredients={ingredients}
            value={value.ingredientId}
            onSelect={(selected) => onChange({ ...value, ingredientId: selected.id, unitCode: selected.baseUnit })}
          />
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-quantity`}>Cantidad</Label>
          <Input
            id={`${idPrefix}-quantity`}
            inputMode="decimal"
            value={value.quantity}
            placeholder="Ej. 500"
            onChange={(event) => onChange({ ...value, quantity: event.target.value.replace(/[^\d.,]/g, "") })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-unit`}>Unidad</Label>
          <Select value={value.unitCode} onValueChange={(unitCode) => onChange({ ...value, unitCode })} disabled={!ingredient}>
            <SelectTrigger id={`${idPrefix}-unit`} className="w-36">
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.code} value={unit.code}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-best-before`}>Consumir preferiblemente antes de (opcional)</Label>
        <Input
          id={`${idPrefix}-best-before`}
          type="date"
          value={value.bestBefore}
          onChange={(event) => onChange({ ...value, bestBefore: event.target.value })}
        />
      </div>
      <FieldError id={`${idPrefix}-error`} message={error} />
    </div>
  );
}
