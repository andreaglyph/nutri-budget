import { Minus, Plus, X } from "lucide-react";

import { ChipGroup } from "@/components/common/ChipGroup";
import { FieldError } from "@/components/common/FieldError";
import { IngredientPicker } from "@/components/common/IngredientPicker";
import { ProvisionalNote } from "@/components/common/ProvisionalNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DietaryTag, Ingredient, MealType } from "@/domain/models";
import { MAX_HOUSEHOLD, MIN_HOUSEHOLD, PROFILE_ERROR_MESSAGES, type ProfileInput, type ProfileValidationError } from "@/domain/rules/profile";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/domain/rules/recipes";

interface ProfileFieldsProps {
  value: ProfileInput;
  onChange: (next: ProfileInput) => void;
  tags: readonly DietaryTag[];
  ingredients: readonly Ingredient[];
  error?: ProfileValidationError | null | undefined;
  showName?: boolean;
}

const mealOptions = MEAL_TYPE_ORDER.map((meal) => ({ value: meal, label: MEAL_TYPE_LABELS[meal] }));

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-base font-bold text-foreground">{title}</legend>
      {hint && <p className="-mt-1 text-sm text-muted-foreground">{hint}</p>}
      {children}
    </fieldset>
  );
}

/**
 * Household + dietary profile editor. Preferences, restrictions, allergies and
 * exclusions are separate groups because only some of them exclude recipes.
 */
export function ProfileFields({ value, onChange, tags, ingredients, error, showName = true }: ProfileFieldsProps) {
  const set = <K extends keyof ProfileInput>(key: K, next: ProfileInput[K]) => onChange({ ...value, [key]: next });
  const optionsFor = (kinds: DietaryTag["kind"][]) =>
    tags.filter((tag) => kinds.includes(tag.kind)).map((tag) => ({ value: tag.id, label: tag.label }));
  const excluded = value.excludedIngredientIds
    .map((id) => ingredients.find((ingredient) => ingredient.id === id))
    .filter((ingredient): ingredient is Ingredient => !!ingredient);

  return (
    <div className="space-y-8">
      <Section title="Tu hogar">
        <div className="grid gap-5 sm:grid-cols-2">
          {showName && (
            <div className="space-y-2">
              <Label htmlFor="profile-name">Tu nombre</Label>
              <Input
                id="profile-name"
                value={value.name}
                autoComplete="name"
                aria-invalid={error === "NAME_REQUIRED"}
                aria-describedby={error === "NAME_REQUIRED" ? "profile-name-error" : undefined}
                onChange={(event) => set("name", event.target.value)}
              />
              <FieldError id="profile-name-error" message={error === "NAME_REQUIRED" ? PROFILE_ERROR_MESSAGES.NAME_REQUIRED : null} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="household-size">Personas que comen en casa</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Quitar una persona"
                disabled={value.householdSize <= MIN_HOUSEHOLD}
                onClick={() => set("householdSize", Math.max(MIN_HOUSEHOLD, value.householdSize - 1))}
              >
                <Minus />
              </Button>
              <Input
                id="household-size"
                inputMode="numeric"
                className="w-16 text-center tabular"
                value={value.householdSize || ""}
                aria-invalid={error === "HOUSEHOLD_RANGE"}
                aria-describedby="household-size-error"
                onChange={(event) => set("householdSize", Number(event.target.value.replace(/\D/g, "").slice(0, 2)) || 0)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Agregar una persona"
                disabled={value.householdSize >= MAX_HOUSEHOLD}
                onClick={() => set("householdSize", Math.min(MAX_HOUSEHOLD, value.householdSize + 1))}
              >
                <Plus />
              </Button>
            </div>
            <FieldError id="household-size-error" message={error === "HOUSEHOLD_RANGE" ? PROFILE_ERROR_MESSAGES.HOUSEHOLD_RANGE : null} />
          </div>
        </div>
      </Section>

      <Section title="Comidas que quieres planificar">
        <ChipGroup<MealType>
          label="Comidas a planificar"
          options={mealOptions}
          selected={value.plannedMealTypes}
          onChange={(next) => set("plannedMealTypes", MEAL_TYPE_ORDER.filter((meal) => next.includes(meal)))}
          describedBy="meals-error"
        />
        <FieldError id="meals-error" message={error === "MEALS_REQUIRED" ? PROFILE_ERROR_MESSAGES.MEALS_REQUIRED : null} />
        <ProvisionalNote>las comidas disponibles son desayuno, almuerzo y cena mientras se confirma el alcance.</ProvisionalNote>
      </Section>

      <Section title="Preferencias" hint="Orientan el menú, pero no excluyen recetas.">
        <ChipGroup label="Preferencias" options={optionsFor(["PREFERENCE"])} selected={value.preferenceTagIds} onChange={(next) => set("preferenceTagIds", next)} />
      </Section>

      <Section title="Restricciones alimentarias" hint="Las recetas que no las cumplan no se incluirán en tu menú.">
        <ChipGroup label="Restricciones" options={optionsFor(["RESTRICTION"])} selected={value.restrictionTagIds} onChange={(next) => set("restrictionTagIds", next)} />
      </Section>

      <Section title="Alergias e intolerancias" hint="Excluimos siempre las recetas con ingredientes relacionados.">
        <ChipGroup
          label="Alergias e intolerancias"
          tone="danger"
          options={optionsFor(["ALLERGY", "INTOLERANCE"])}
          selected={value.allergyTagIds}
          onChange={(next) => set("allergyTagIds", next)}
        />
        <p className="text-xs text-muted-foreground">
          NutriBudget no reemplaza la orientación de un profesional de la salud. Revisa siempre las etiquetas de los productos.
        </p>
      </Section>

      <Section title="Ingredientes que no quieres comer" hint="Exclusión voluntaria: no es una restricción médica.">
        <div className="max-w-sm">
          <IngredientPicker
            ingredients={ingredients}
            hiddenIds={value.excludedIngredientIds}
            placeholder="Agregar ingrediente a excluir"
            onSelect={(ingredient) => set("excludedIngredientIds", [...value.excludedIngredientIds, ingredient.id])}
          />
        </div>
        {excluded.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {excluded.map((ingredient) => (
              <li key={ingredient.id}>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pl-3 pr-1 text-sm text-foreground">
                  {ingredient.name}
                  <button
                    type="button"
                    className="grid size-6 place-items-center rounded-full hover:bg-border"
                    aria-label={`Quitar ${ingredient.name} de las exclusiones`}
                    onClick={() => set("excludedIngredientIds", value.excludedIngredientIds.filter((id) => id !== ingredient.id))}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No has excluido ingredientes.</p>
        )}
      </Section>
    </div>
  );
}
