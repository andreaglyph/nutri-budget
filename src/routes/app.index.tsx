import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ChefHat, Lightbulb, Refrigerator, ShoppingBasket, Wallet } from "lucide-react";
import { useMemo } from "react";

import { BudgetSummaryCard } from "@/components/budget/BudgetSummaryCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryError, QueryNotFound } from "@/components/common/QueryError";
import { ProvisionalNote } from "@/components/common/ProvisionalNote";
import { daysLabel, ExpiryBadge } from "@/components/inventory/ExpiryBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findBudgetForDate, spentForBudget } from "@/domain/rules/budget";
import { formatLongDate, todayISO } from "@/domain/rules/dates";
import { formatCOP } from "@/domain/rules/format";
import { batchStatus, daysUntilBestBefore, groupBatchesByIngredient, isLowStock, sortByBestBefore } from "@/domain/rules/inventory";
import { blockingTagIds } from "@/domain/rules/profile";
import { isRecipeCompatible, recipeCost } from "@/domain/rules/recipes";
import { formatQuantity } from "@/domain/rules/units";
import { pageHead } from "@/lib/seo";
import { budgetsQuery, catalogQuery, inventoryQuery, profileQuery, purchasesQuery, useCatalog, useUserId } from "@/state/queries";

export const Route = createFileRoute("/app/")({
  head: () => pageHead("Dashboard", "Resumen de tu presupuesto, tus comidas, tu inventario y tus compras pendientes.", { private: true }),
  loader: async ({ context }) => {
    const userId = context.session.userId;
    await Promise.all([
      context.queryClient.ensureQueryData(catalogQuery()),
      context.queryClient.ensureQueryData(profileQuery(userId)),
      context.queryClient.ensureQueryData(budgetsQuery(userId)),
      context.queryClient.ensureQueryData(purchasesQuery(userId)),
      context.queryClient.ensureQueryData(inventoryQuery(userId)),
    ]);
  },
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
  component: DashboardPage,
});

function DashboardPage() {
  const userId = useUserId();
  const today = todayISO();
  const { catalog, index } = useCatalog();
  const { data: details } = useSuspenseQuery(profileQuery(userId));
  const { data: budgets } = useSuspenseQuery(budgetsQuery(userId));
  const { data: purchases } = useSuspenseQuery(purchasesQuery(userId));
  const { data: inventory } = useSuspenseQuery(inventoryQuery(userId));

  const currentBudget = findBudgetForDate(budgets, today);
  const spent = currentBudget ? spentForBudget(purchases, currentBudget.id) : 0;

  const expiring = useMemo(
    () =>
      sortByBestBefore(inventory).filter((batch) => {
        const status = batchStatus(batch, today);
        return status === "EXPIRING" || status === "EXPIRED";
      }),
    [inventory, today],
  );

  const lowStock = useMemo(
    () =>
      groupBatchesByIngredient(inventory, today).filter((group) => {
        const ingredient = index.ingredientsById.get(group.ingredientId);
        return ingredient ? isLowStock(group.usableQuantity, ingredient.baseUnit) : false;
      }),
    [inventory, today, index],
  );

  const suggestions = useMemo(() => {
    const expiringIds = new Set(expiring.filter((batch) => batchStatus(batch, today) === "EXPIRING").map((batch) => batch.ingredientId));
    const blocking = blockingTagIds(details);
    return catalog.recipes
      .filter((recipe) => isRecipeCompatible(recipe, catalog.conflicts, blocking, details.excludedIngredientIds))
      .map((recipe) => ({ recipe, uses: recipe.ingredients.filter((item) => expiringIds.has(item.ingredientId)).length }))
      .filter((entry) => entry.uses > 0)
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 3);
  }, [catalog, details, expiring, today]);

  const firstName = details.user.name.split(" ")[0];
  const expiringSoonCount = expiring.filter((batch) => batchStatus(batch, today) === "EXPIRING").length;
  const expiredCount = expiring.length - expiringSoonCount;

  const tips: string[] = [];
  if (!currentBudget) tips.push("Define tu presupuesto de esta semana para que podamos ajustar el menú a lo que puedes gastar.");
  if (expiringSoonCount > 0) tips.push(`Tienes ${expiringSoonCount} ${expiringSoonCount === 1 ? "lote" : "lotes"} por consumir pronto: úsalos primero en tus comidas.`);
  if (expiredCount > 0) tips.push(`Revisa ${expiredCount === 1 ? "1 lote vencido" : `${expiredCount} lotes vencidos`} en tu inventario y retíralos si ya no están en buen estado.`);
  if (inventory.length === 0) tips.push("Registra lo que tienes en casa para no comprar lo que ya tienes.");

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(today)}
        title={`Hola, ${firstName}`}
        description={`Así va tu semana. Hogar de ${details.profile.householdSize} ${details.profile.householdSize === 1 ? "persona" : "personas"}.`}
      />

      {tips.length > 0 && (
        <section aria-label="Sugerencias" className="mb-6 rounded-2xl bg-highlight-soft p-4 md:p-5">
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-highlight-foreground">
                <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {currentBudget ? (
          <BudgetSummaryCard
            className="lg:col-span-2"
            budget={currentBudget}
            spent={spent}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/presupuesto">
                  Ver presupuesto <ArrowRight />
                </Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            className="lg:col-span-2"
            icon={Wallet}
            title="Aún no tienes presupuesto para esta semana"
            description="Cuéntanos cuánto quieres gastar en comida y te mostraremos cuánto llevas y cuánto te queda."
            action={
              <Button asChild>
                <Link to="/app/presupuesto">Definir presupuesto</Link>
              </Button>
            }
          />
        )}

        <section className="surface-card flex flex-col p-5 md:p-6" aria-labelledby="menu-card-title">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <h2 id="menu-card-title" className="font-display text-base font-bold text-foreground">Menú de la semana</h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Aún no has generado tu menú. Pronto podrás crearlo según tu presupuesto, tus restricciones y lo que tienes en casa.
          </p>
          <div className="mt-auto pt-5">
            <Badge variant="warning">Disponible en la Etapa 4</Badge>
          </div>
        </section>

        <section className="surface-card p-5 md:p-6 lg:col-span-2" aria-labelledby="expiring-title">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <Refrigerator className="size-5" aria-hidden="true" />
              </span>
              <h2 id="expiring-title" className="font-display text-base font-bold text-foreground">Por consumir pronto</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/inventario">
                Inventario <ArrowRight />
              </Link>
            </Button>
          </div>
          {expiring.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nada por vencer en los próximos días. ¡Bien!</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {expiring.slice(0, 5).map((batch) => {
                const ingredient = index.ingredientsById.get(batch.ingredientId);
                const status = batchStatus(batch, today);
                return (
                  <li key={batch.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ingredient?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ingredient ? formatQuantity(batch.quantity, ingredient.baseUnit) : ""} · {daysLabel(daysUntilBestBefore(batch.bestBefore, today))}
                      </p>
                    </div>
                    <ExpiryBadge status={status} />
                  </li>
                );
              })}
            </ul>
          )}
          {lowStock.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground">Por reponer</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lowStock.map((group) => index.ingredientsById.get(group.ingredientId)?.name).filter(Boolean).join(", ")}
              </p>
              <ProvisionalNote className="mt-3">el criterio de “por reponer” (menos de 100 g/ml o 2 unidades) es un ejemplo.</ProvisionalNote>
            </div>
          )}
        </section>

        <section className="surface-card flex flex-col p-5 md:p-6" aria-labelledby="shopping-card-title">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <ShoppingBasket className="size-5" aria-hidden="true" />
            </span>
            <h2 id="shopping-card-title" className="font-display text-base font-bold text-foreground">Compras pendientes</h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Tu lista de compras se crea a partir del menú, descontando lo que ya tienes en casa.
          </p>
          <p className="mt-4 text-sm text-foreground">
            Compras registradas esta semana:{" "}
            <span className="font-semibold tabular">
              {currentBudget ? purchases.filter((purchase) => purchase.budgetId === currentBudget.id).length : 0}
            </span>
          </p>
          <div className="mt-auto pt-5">
            <Badge variant="warning">Lista disponible en la Etapa 4</Badge>
          </div>
        </section>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-8" aria-labelledby="suggestions-title">
          <h2 id="suggestions-title" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <ChefHat className="size-5 text-primary" aria-hidden="true" /> Recetas con lo que vence pronto
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {suggestions.map(({ recipe, uses }) => (
              <li key={recipe.id}>
                <Link
                  to="/app/recetas/$recipeId"
                  params={{ recipeId: recipe.id }}
                  className="surface-card flex items-center gap-3 p-3 transition-shadow hover:shadow-raised"
                >
                  <img src={recipe.imageUrl} alt="" width={64} height={64} loading="lazy" className="size-16 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{recipe.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      Usa {uses} {uses === 1 ? "ingrediente" : "ingredientes"} por vencer ·{" "}
                      {formatCOP(recipeCost(recipe, details.profile.householdSize, index.pricesByIngredient).total)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
