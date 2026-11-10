import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Loader2, PackagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { QueryError, QueryNotFound } from "@/components/common/QueryError";
import { BudgetFields, budgetErrorField, type BudgetDraft } from "@/components/budget/BudgetFields";
import { BatchFields, EMPTY_BATCH, draftToInput, type BatchDraft } from "@/components/inventory/BatchFields";
import { ProfileFields } from "@/components/profile/ProfileFields";
import { Button } from "@/components/ui/button";
import { BUDGET_ERROR_MESSAGES, validateBudget } from "@/domain/rules/budget";
import { mondayOf, todayISO } from "@/domain/rules/dates";
import { BATCH_ERROR_MESSAGES, validateBatchInput, type BatchInput } from "@/domain/rules/inventory";
import { EMPTY_DIETARY_SELECTION, validateProfile, type ProfileInput, type ProfileValidationError } from "@/domain/rules/profile";
import { findUnit, formatQuantity, toBaseQuantity } from "@/domain/rules/units";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/simulated-api";
import { useCompleteOnboarding } from "@/state/mutations";
import { budgetsQuery, catalogQuery, profileQuery, useCatalog } from "@/state/queries";
import { useSession } from "@/state/use-session";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => pageHead("Configura tu hogar", "Configura tu perfil, presupuesto e inventario en tres pasos.", { private: true }),
  beforeLoad: ({ location }) => {
    const session = authService.getSession();
    if (!session) throw redirect({ to: "/ingresar", search: { redirect: location.href } });
    if (session.onboardingCompleted) throw redirect({ to: "/app" });
    return { session };
  },
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(catalogQuery()), context.queryClient.ensureQueryData(profileQuery(context.session.userId)), context.queryClient.ensureQueryData(budgetsQuery(context.session.userId))]);
  },
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
  component: OnboardingPage,
});

const STEPS = [
  { title: "Tu hogar y tu alimentación", short: "Perfil" },
  { title: "Tu presupuesto semanal", short: "Presupuesto" },
  { title: "Lo que ya tienes en casa", short: "Inventario" },
];

function OnboardingPage() {
  const { session } = Route.useRouteContext();
  const live = useSession();
  const userId = session.userId;
  const navigate = useNavigate();
  const { catalog, index } = useCatalog();
  const { data: details } = useSuspenseQuery(profileQuery(userId));
  const { data: budgets } = useSuspenseQuery(budgetsQuery(userId));
  const complete = useCompleteOnboarding(userId);

  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileInput>(() => ({
    ...EMPTY_DIETARY_SELECTION,
    name: details.user.name,
    householdSize: details.profile.householdSize,
    plannedMealTypes: details.profile.plannedMealTypes.length ? details.profile.plannedMealTypes : ["BREAKFAST", "LUNCH", "DINNER"],
  }));
  const [profileError, setProfileError] = useState<ProfileValidationError | null>(null);
  const [budget, setBudget] = useState<BudgetDraft>(() => ({ amount: null, startDate: mondayOf(todayISO()) }));
  const [budgetError, setBudgetError] = useState<{ message: string; code: string } | null>(null);
  const [batches, setBatches] = useState<BatchInput[]>([]);
  const [batchDraft, setBatchDraft] = useState<BatchDraft>(EMPTY_BATCH);
  const [batchError, setBatchError] = useState<string | null>(null);

  const next = () => {
    if (step === 0) {
      const error = validateProfile(profile);
      setProfileError(error);
      if (error) return;
    }
    if (step === 1) {
      const error = validateBudget({ amount: budget.amount ?? 0, startDate: budget.startDate }, budgets);
      setBudgetError(error ? { code: error, message: BUDGET_ERROR_MESSAGES[error] } : null);
      if (error) return;
    }
    setStep((current) => current + 1);
    window.scrollTo({ top: 0 });
  };

  const addBatch = () => {
    const input = draftToInput(batchDraft);
    const error = validateBatchInput(input, index.ingredientsById.get(input.ingredientId)?.baseUnit, findUnit(input.unitCode)?.baseUnit);
    if (error) {
      setBatchError(BATCH_ERROR_MESSAGES[error]);
      return;
    }
    setBatches((current) => [...current, input]);
    setBatchDraft(EMPTY_BATCH);
    setBatchError(null);
  };

  const finish = async (withInventory: boolean) => {
    try {
      await complete.mutateAsync({
        profile,
        budget: { amount: budget.amount ?? 0, startDate: budget.startDate },
        inventory: withInventory ? batches : [],
      });
      toast.success("¡Listo! Tu hogar está configurado.");
      navigate({ to: "/app" });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No pudimos guardar tu configuración.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <span className="text-sm text-muted-foreground">Hola, {(live ?? session).name.split(" ")[0]}</span>
        </div>
      </header>
      <main className="container-page max-w-3xl py-8 md:py-12">
        <ol className="grid grid-cols-3 gap-2" aria-label="Progreso de la configuración">
          {STEPS.map((item, position) => (
            <li key={item.short} aria-current={position === step ? "step" : undefined}>
              <div className={cn("h-1.5 rounded-full", position <= step ? "bg-primary" : "bg-border")} />
              <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-semibold", position <= step ? "text-primary-strong" : "text-muted-foreground")}>
                {position < step && <Check className="size-3.5" aria-hidden="true" />}
                <span>
                  {position + 1}. {item.short}
                </span>
              </p>
            </li>
          ))}
        </ol>

        <section className="surface-card mt-6 p-5 md:p-8" aria-labelledby="onboarding-step-title">
          <p className="text-eyebrow text-primary">Paso {step + 1} de 3</p>
          <h1 id="onboarding-step-title" className="text-title mt-1 text-foreground">{STEPS[step]?.title}</h1>

          <div className="mt-8">
            {step === 0 && (
              <ProfileFields value={profile} onChange={setProfile} tags={catalog.dietaryTags} ingredients={catalog.ingredients} error={profileError} />
            )}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  ¿Cuánto quieres gastar en comida esta semana? Lo usaremos para proponerte un menú que quepa en tu bolsillo.
                </p>
                <BudgetFields value={budget} onChange={setBudget} error={budgetError?.message} errorField={budgetErrorField(budgetError?.code)} />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Registra lo que ya tienes para usarlo primero y no comprarlo dos veces. Puedes omitir este paso y hacerlo después.
                </p>
                <div className="rounded-xl border border-border p-4">
                  <BatchFields idPrefix="onboarding-batch" value={batchDraft} onChange={setBatchDraft} ingredients={catalog.ingredients} error={batchError} />
                  <Button type="button" variant="secondary" className="mt-4" onClick={addBatch}>
                    <PackagePlus /> Agregar a mi inventario
                  </Button>
                </div>
                {batches.length > 0 && (
                  <ul className="divide-y divide-border rounded-xl border border-border" aria-label="Ingredientes agregados">
                    {batches.map((batch, position) => {
                      const ingredient = index.ingredientsById.get(batch.ingredientId);
                      return (
                        <li key={`${batch.ingredientId}-${position}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                          <span>
                            <span className="font-semibold text-foreground">{ingredient?.name}</span>{" "}
                            <span className="text-muted-foreground">
                              · {ingredient ? formatQuantity(toBaseQuantity(batch.quantity, batch.unitCode, ingredient.baseUnit), ingredient.baseUnit) : ""}
                            </span>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Quitar ${ingredient?.name ?? "ingrediente"}`}
                            onClick={() => setBatches((current) => current.filter((_, item) => item !== position))}
                          >
                            <Trash2 />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)} disabled={complete.isPending}>
                <ArrowLeft /> Anterior
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button type="button" size="lg" onClick={next}>
                Continuar <ArrowRight />
              </Button>
            ) : (
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="outline" size="lg" onClick={() => finish(false)} disabled={complete.isPending}>
                  Omitir por ahora
                </Button>
                <Button type="button" size="lg" onClick={() => finish(true)} disabled={complete.isPending || batches.length === 0}>
                  {complete.isPending && <Loader2 className="animate-spin" />}
                  Guardar y terminar
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
