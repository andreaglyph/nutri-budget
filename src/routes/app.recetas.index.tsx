import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Utensils, X } from "lucide-react";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { EstimatedPriceNote } from "@/components/common/ProvisionalNote";
import { QueryError, QueryNotFound } from "@/components/common/QueryError";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { MealType } from "@/domain/models";
import { blockingTagIds } from "@/domain/rules/profile";
import { isRecipeCompatible, matchesFilters, MEAL_TYPE_LABELS, MEAL_TYPE_ORDER, recipeCost, suitableTags } from "@/domain/rules/recipes";
import { pageHead } from "@/lib/seo";
import { catalogQuery, profileQuery, useCatalog, useUserId } from "@/state/queries";

export const Route = createFileRoute("/app/recetas/")({
  validateSearch: zodValidator(z.object({
    q: z.string().catch("").default(""),
    meal: z.enum(["BREAKFAST", "LUNCH", "DINNER"]).optional().catch(undefined),
    minutes: z.coerce.number().positive().optional().catch(undefined),
    ingredient: z.string().catch("").default(""),
    group: z.string().catch("").default(""),
    tag: z.string().catch("").default(""),
    maxCost: z.coerce.number().positive().optional().catch(undefined),
    compatible: z.union([z.boolean(), z.literal("true"), z.literal("false")]).transform(v => v === true || v === "true").catch(false).default(false),
  })),
  head: () => pageHead("Recetas", "Recetas colombianas con ingredientes, tiempo y costo estimado para tu hogar.", { private: true }),
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(catalogQuery()), context.queryClient.ensureQueryData(profileQuery(context.session.userId))]); },
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
  component: RecipesPage,
});

function RecipesPage() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const userId = useUserId();
  const { catalog, index } = useCatalog();
  const { data: profile } = useSuspenseQuery(profileQuery(userId));
  const servings = profile.profile.householdSize;
  const blocking = blockingTagIds(profile);
  const costOf = (recipe: (typeof catalog.recipes)[number]) => recipeCost(recipe, servings, index.pricesByIngredient).total;
  const compatible = (recipe: (typeof catalog.recipes)[number]) => isRecipeCompatible(recipe, catalog.conflicts, blocking, profile.excludedIngredientIds);
  const recipes = catalog.recipes.filter(recipe => (!filters.compatible || compatible(recipe)) && matchesFilters(recipe, {
    query: filters.q, mealType: filters.meal, maxMinutes: filters.minutes, ingredientId: filters.ingredient || undefined,
    foodGroup: filters.group || undefined, suitableForTagId: filters.tag || undefined, maxCost: filters.maxCost,
  }, { conflicts: catalog.conflicts, ingredientsById: index.ingredientsById, costOf }));
  const update = (next: Partial<typeof filters>) => { void navigate({ search: prev => ({ ...prev, ...next }), replace: true }); };
  const reset = () => update({ q: "", meal: undefined, minutes: undefined, ingredient: "", group: "", tag: "", maxCost: undefined, compatible: false });
  return <>
    <PageHeader eyebrow="Recetario" title="Recetas para tu mesa" description={`${servings} ${servings === 1 ? "persona" : "personas"} en casa · sabores de todos los días`} />
    <EstimatedPriceNote />
    <div className="mt-6 space-y-3">
      <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Buscar recetas" placeholder="Buscar receta o ingrediente" className="pl-9" value={filters.q} onChange={e => update({ q: e.target.value })} /></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RecipeSelect label="Tipo de comida" value={filters.meal || "all"} onChange={v => update({ meal: v === "all" ? undefined : v as MealType })} options={MEAL_TYPE_ORDER.map(v => [v, MEAL_TYPE_LABELS[v]])} />
        <RecipeSelect label="Tiempo de preparación" value={String(filters.minutes || "all")} onChange={v => update({ minutes: v === "all" ? undefined : Number(v) })} options={[["15", "Hasta 15 minutos"], ["30", "Hasta 30 minutos"], ["60", "Hasta 60 minutos"]]} />
        <RecipeSelect label="Ingrediente" value={filters.ingredient || "all"} onChange={v => update({ ingredient: v === "all" ? "" : v })} options={catalog.ingredients.map(v => [v.id, v.name])} />
        <RecipeSelect label="Grupo de alimentos" value={filters.group || "all"} onChange={v => update({ group: v === "all" ? "" : v })} options={index.foodGroups.map(v => [v, v])} />
        <RecipeSelect label="Apta para" value={filters.tag || "all"} onChange={v => update({ tag: v === "all" ? "" : v })} options={catalog.dietaryTags.filter(v => v.kind !== "PREFERENCE").map(v => [v.id, v.label])} />
        <Input aria-label="Costo total máximo en COP" type="number" min="1" placeholder="Costo total máximo (COP)" value={filters.maxCost ?? ""} onChange={e => update({ maxCost: Number(e.target.value) > 0 ? Number(e.target.value) : undefined })} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><Checkbox checked={filters.compatible} onCheckedChange={v => update({ compatible: v === true })} /> Solo compatibles con mi perfil</label><Button variant="ghost" onClick={reset}><X /> Limpiar filtros</Button></div>
    </div>
    <p className="my-4 text-sm text-muted-foreground">{recipes.length} recetas</p>
    {recipes.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} cost={costOf(recipe)} servings={servings} compatible={compatible(recipe)} suitableLabels={suitableTags(recipe, catalog.conflicts, catalog.dietaryTags).map(v => v.label)} />)}</div> : <EmptyState icon={Utensils} title="No encontramos recetas" description="No hay recetas que coincidan con estos filtros." action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>} />}
  </>;
}
function RecipeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{label}: todos</SelectItem>{options.map(([key, text]) => key ? <SelectItem key={key} value={key}>{text}</SelectItem> : null)}</SelectContent></Select>;
}
