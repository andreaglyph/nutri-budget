import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BudgetFields, budgetErrorField, type BudgetDraft } from "@/components/budget/BudgetFields";
import { BUDGET_STATUS_LABEL, BudgetSummaryCard } from "@/components/budget/BudgetSummaryCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ProvisionalNote } from "@/components/common/ProvisionalNote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Budget } from "@/domain/models";
import { budgetTimeline, findBudgetForDate, spentForBudget, summarizeBudget } from "@/domain/rules/budget";
import { addDays, formatRange, mondayOf, todayISO } from "@/domain/rules/dates";
import { formatCOP } from "@/domain/rules/format";
import { pageHead } from "@/lib/seo";
import { ApiError } from "@/services/simulated-api";
import { useSaveBudget } from "@/state/mutations";
import { budgetsQuery, purchasesQuery, useUserId } from "@/state/queries";

export const Route = createFileRoute("/app/presupuesto")({
  head: () => pageHead("Mi presupuesto", "Define tu presupuesto semanal y compara lo estimado con lo gastado.", { private: true }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(budgetsQuery(context.session.userId));
    context.queryClient.ensureQueryData(purchasesQuery(context.session.userId));
  },
  component: BudgetPage,
});

const TIMELINE = { CURRENT: "Esta semana", UPCOMING: "Próximo", PAST: "Finalizado" } as const;

function BudgetPage() {
  const userId = useUserId();
  const today = todayISO();
  const { data: budgets } = useSuspenseQuery(budgetsQuery(userId));
  const { data: purchases } = useSuspenseQuery(purchasesQuery(userId));
  const save = useSaveBudget(userId);
  const [editing, setEditing] = useState<{ id?: string; draft: BudgetDraft } | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const current = findBudgetForDate(budgets, today);

  const openNew = () => {
    const latest = budgets[0];
    const start = latest && latest.endDate >= today ? addDays(latest.endDate, 1) : mondayOf(today);
    setError(null);
    setEditing({ draft: { amount: latest?.amount ?? null, startDate: start } });
  };
  const openEdit = (budget: Budget) => {
    setError(null);
    setEditing({ id: budget.id, draft: { amount: budget.amount, startDate: budget.startDate } });
  };

  const submit = async () => {
    if (!editing) return;
    try {
      await save.mutateAsync({ id: editing.id, input: { amount: editing.draft.amount ?? 0, startDate: editing.draft.startDate } });
      toast.success(editing.id ? "Presupuesto actualizado" : "Presupuesto creado");
      setEditing(null);
    } catch (err) {
      setError(err instanceof ApiError ? { code: err.code, message: err.message } : { code: "UNKNOWN", message: "No pudimos guardar el presupuesto." });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Presupuesto"
        title="Mi presupuesto"
        description="Cada presupuesto cubre 7 días. Lo gastado se calcula con el valor real de tus compras."
        actions={
          <Button onClick={openNew}>
            <Plus /> Nuevo presupuesto
          </Button>
        }
      />

      {current ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <BudgetSummaryCard
            budget={current}
            spent={spentForBudget(purchases, current.id)}
            action={
              <Button variant="outline" size="sm" onClick={() => openEdit(current)}>
                <Pencil /> Editar
              </Button>
            }
          />
          <section className="surface-card p-5 md:p-6" aria-labelledby="estimate-title">
            <h2 id="estimate-title" className="font-display text-base font-bold text-foreground">Estimado vs. real</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Costo estimado del menú</dt>
                <dd className="font-semibold text-muted-foreground">Sin menú generado</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Gasto real registrado</dt>
                <dd className="font-semibold text-foreground tabular">{formatCOP(spentForBudget(purchases, current.id))}</dd>
              </div>
            </dl>
            <ProvisionalNote className="mt-5">
              la viabilidad del menú se medirá con el costo estimado de lo que falta comprar. El generador llega en la Etapa 4.
            </ProvisionalNote>
          </section>
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No tienes presupuesto para esta semana"
          description="Define cuánto quieres gastar en comida durante 7 días."
          action={<Button onClick={openNew}>Definir presupuesto</Button>}
        />
      )}

      <section className="mt-8" aria-labelledby="all-budgets">
        <h2 id="all-budgets" className="font-display text-lg font-bold text-foreground">Todos tus presupuestos</h2>
        {budgets.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aún no has creado presupuestos.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border surface-card">
            {budgets.map((budget) => {
              const spent = spentForBudget(purchases, budget.id);
              const summary = summarizeBudget(budget.amount, spent);
              const timeline = budgetTimeline(budget, today);
              return (
                <li key={budget.id} className="flex flex-wrap items-center gap-3 px-4 py-4 md:px-5">
                  <div className="min-w-48 flex-1">
                    <p className="text-sm font-semibold text-foreground">{formatRange(budget.startDate, budget.endDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCOP(spent, { suffix: false })} de {formatCOP(budget.amount)} · {summary.percentUsed.toLocaleString("es-CO")}%
                    </p>
                  </div>
                  <Badge variant={timeline === "CURRENT" ? "default" : "neutral"}>{TIMELINE[timeline]}</Badge>
                  {timeline !== "UPCOMING" && <Badge variant={BUDGET_STATUS_LABEL[summary.status].variant}>{BUDGET_STATUS_LABEL[summary.status].label}</Badge>}
                  {timeline !== "PAST" && (
                    <Button variant="ghost" size="sm" onClick={() => openEdit(budget)} aria-label={`Editar presupuesto ${formatRange(budget.startDate, budget.endDate)}`}>
                      <Pencil /> Editar
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar presupuesto" : "Nuevo presupuesto"}</DialogTitle>
            <DialogDescription>No puede cruzarse con las fechas de otro presupuesto.</DialogDescription>
          </DialogHeader>
          {editing && (
            <BudgetFields
              value={editing.draft}
              onChange={(draft) => setEditing({ ...editing, draft })}
              error={error?.message}
              errorField={budgetErrorField(error?.code)}
            />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />} Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
