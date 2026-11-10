import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Minus, Plus, ShieldAlert, Users } from "lucide-react";
import { useState } from "react";
import { EstimatedPriceNote } from "@/components/common/ProvisionalNote";
import { QueryError, QueryNotFound } from "@/components/common/QueryError";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { todayISO } from "@/domain/rules/dates";
import { formatCOP } from "@/domain/rules/format";
import { usableQuantityByIngredient } from "@/domain/rules/inventory";
import { blockingTagIds, MAX_HOUSEHOLD } from "@/domain/rules/profile";
import { incompatibilityReasons, recipeCost, scaleIngredients, MEAL_TYPE_LABELS } from "@/domain/rules/recipes";
import { formatQuantity } from "@/domain/rules/units";
import { pageHead } from "@/lib/seo";
import { catalogQuery, inventoryQuery, profileQuery, useCatalog, useUserId } from "@/state/queries";

export const Route = createFileRoute("/app/recetas/$recipeId")({
  head: ({ loaderData }) => pageHead(loaderData?.name ?? "Receta no disponible", "Ingredientes, preparación y costo estimado para tu hogar.", { private: true }),
  loader: async ({ context, params }) => {
    const [catalog] = await Promise.all([context.queryClient.ensureQueryData(catalogQuery()), context.queryClient.ensureQueryData(profileQuery(context.session.userId)), context.queryClient.ensureQueryData(inventoryQuery(context.session.userId))]);
    const recipe = catalog.recipes.find(v => v.id === params.recipeId);
    if (!recipe) throw notFound();
    return { name: recipe.name };
  },
  errorComponent: QueryError, notFoundComponent: QueryNotFound,
  component: RecipePage,
});
function RecipePage() {
  const { recipeId } = Route.useParams();
  const userId = useUserId();
  const { catalog, index } = useCatalog();
  const { data: profile } = useSuspenseQuery(profileQuery(userId));
  const { data: inventory } = useSuspenseQuery(inventoryQuery(userId));
  const [servings, setServings] = useState(profile.profile.householdSize);
  const recipe = index.recipesById.get(recipeId);
  if (!recipe) return <QueryNotFound />;
  const cost = recipeCost(recipe, servings, index.pricesByIngredient);
  const stock = usableQuantityByIngredient(inventory, todayISO());
  const reasons = incompatibilityReasons(recipe, catalog.conflicts, blockingTagIds(profile), profile.excludedIngredientIds);
  const warnings = [...new Set(reasons.map(r => `${index.ingredientsById.get(r.ingredientId)?.name ?? r.ingredientId}: ${r.tagId ? index.tagsById.get(r.tagId)?.label : "ingrediente excluido"}`))];
  return <>
    <Button asChild variant="ghost" className="mb-4"><Link to="/app/recetas" search={{ q: "", meal: undefined, minutes: undefined, ingredient: "", group: "", tag: "", maxCost: undefined, compatible: false }}><ArrowLeft /> Recetas</Link></Button>
    <div className="grid gap-6 lg:grid-cols-2">
      <img src={recipe.imageUrl} alt={recipe.name} className="aspect-[4/3] w-full rounded-lg object-cover" />
      <div><div className="flex flex-wrap gap-2">{recipe.mealTypes.map(m => <Badge key={m} variant="secondary">{MEAL_TYPE_LABELS[m]}</Badge>)}</div><h1 className="text-title mt-3">{recipe.name}</h1><p className="mt-3 text-muted-foreground">{recipe.description}</p>
        <p className="mt-5 flex items-center gap-2 text-sm"><Clock className="size-4" /> {recipe.prepMinutes} minutos</p>
        <div className="my-5 flex items-center gap-3"><Users className="size-4" /><span className="text-sm">Porciones</span><Button variant="outline" size="icon" aria-label="Quitar porción" disabled={servings <= 1} onClick={() => setServings(v => v - 1)}><Minus /></Button><output aria-label="Porciones" className="w-8 text-center tabular">{servings}</output><Button variant="outline" size="icon" aria-label="Agregar porción" disabled={servings >= MAX_HOUSEHOLD} onClick={() => setServings(v => v + 1)}><Plus /></Button></div>
        <dl className="grid grid-cols-2 gap-4 border-y border-border py-4"><div><dt className="text-sm text-muted-foreground">Costo total estimado</dt><dd className="font-display text-xl font-bold">{formatCOP(cost.total)}</dd></div><div><dt className="text-sm text-muted-foreground">Por porción</dt><dd className="font-display text-xl font-bold">{formatCOP(cost.perServing)}</dd></div></dl><EstimatedPriceNote className="mt-4" />
        {cost.missingPrices.length > 0 && <p className="mt-3 text-sm text-destructive">Costo incompleto: faltan precios de ingredientes.</p>}
        {warnings.length > 0 && <div role="alert" className="mt-4 rounded-lg bg-destructive-soft p-4 text-destructive"><p className="flex items-center gap-2 font-semibold"><ShieldAlert className="size-4" /> No compatible con tu perfil</p><ul className="mt-2 list-inside list-disc text-sm">{warnings.map(w => <li key={w}>{w}</li>)}</ul></div>}
      </div>
    </div>
    <section className="mt-8"><h2 className="font-display text-xl font-bold">Ingredientes</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-sunken"><tr>{["Ingrediente", "Necesario", "En casa", "Falta"].map(v => <th key={v} className="p-3 font-semibold">{v}</th>)}</tr></thead><tbody className="divide-y divide-border">{scaleIngredients(recipe, servings).map(item => {
      const ingredient = index.ingredientsById.get(item.ingredientId);
      if (!ingredient) return null;
      const available = stock.get(item.ingredientId) ?? 0;
      return <tr key={item.ingredientId}><th className="p-3 font-medium">{ingredient.name}</th><td className="p-3 whitespace-nowrap">{formatQuantity(item.quantity, ingredient.baseUnit)}</td><td className="p-3 whitespace-nowrap">{formatQuantity(available, ingredient.baseUnit)}</td><td className="p-3 whitespace-nowrap">{formatQuantity(Math.max(0, item.quantity - available), ingredient.baseUnit)}</td></tr>;
    })}</tbody></table></div><p className="mt-3 text-xs text-muted-foreground">No se incluyen lotes vencidos o agotados. Consultar esta receta no descuenta tu inventario.</p></section>
    <section className="mt-8"><h2 className="font-display text-xl font-bold">Preparación</h2><ol className="mt-4 space-y-5">{recipe.steps.map((step, i) => <li key={i} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-primary-strong">{i + 1}</span><p className="pt-1 text-sm leading-relaxed">{step}</p></li>)}</ol></section>
    <div className="mt-6 flex flex-wrap gap-2">{recipe.foodGroups.map(g => <Badge key={g} variant="outline">{g}</Badge>)}</div>
  </>;
}
