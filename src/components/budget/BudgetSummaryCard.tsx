import { Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Budget } from "@/domain/models";
import { summarizeBudget, type BudgetStatus } from "@/domain/rules/budget";
import { formatRange } from "@/domain/rules/dates";
import { formatCOP } from "@/domain/rules/format";
import { cn } from "@/lib/utils";

export const BUDGET_STATUS_LABEL: Record<BudgetStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  WITHIN: { label: "Dentro del presupuesto", variant: "success" },
  NEAR_LIMIT: { label: "Cerca del límite", variant: "warning" },
  OVER: { label: "Presupuesto superado", variant: "destructive" },
};

interface BudgetSummaryCardProps {
  budget: Budget;
  spent: number;
  title?: string;
  action?: ReactNode;
  className?: string;
}

export function BudgetSummaryCard({ budget, spent, title = "Presupuesto de esta semana", action, className }: BudgetSummaryCardProps) {
  const summary = summarizeBudget(budget.amount, spent);
  const status = BUDGET_STATUS_LABEL[summary.status];
  return (
    <section className={cn("surface-card p-5 md:p-6", className)} aria-label={title}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{formatRange(budget.startDate, budget.endDate)}</p>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <p className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground tabular">{formatCOP(budget.amount)}</p>
      <Progress
        value={Math.min(summary.percentUsed, 100)}
        className={cn("mt-4 h-2.5", summary.status === "OVER" && "[&>div]:bg-destructive", summary.status === "NEAR_LIMIT" && "[&>div]:bg-highlight")}
        aria-label={`Has usado el ${summary.percentUsed}% del presupuesto`}
      />
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Gastado</dt>
          <dd className="font-semibold text-foreground tabular">{formatCOP(summary.spent, { suffix: false })}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{summary.balance < 0 ? "Excedido" : "Disponible"}</dt>
          <dd className={cn("font-semibold tabular", summary.balance < 0 ? "text-destructive" : "text-primary-strong")}>
            {formatCOP(Math.abs(summary.balance), { suffix: false })}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Usado</dt>
          <dd className="font-semibold text-foreground tabular">{summary.percentUsed.toLocaleString("es-CO")}%</dd>
        </div>
      </dl>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
