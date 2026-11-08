import { CalendarRange } from "lucide-react";

import { FieldError } from "@/components/common/FieldError";
import { MoneyInput } from "@/components/common/MoneyInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidISODate, formatLongDate } from "@/domain/rules/dates";
import { weeklyEndDate } from "@/domain/rules/budget";

export interface BudgetDraft {
  amount: number | null;
  startDate: string;
}

interface BudgetFieldsProps {
  value: BudgetDraft;
  onChange: (next: BudgetDraft) => void;
  error?: string | null | undefined;
  errorField?: "amount" | "startDate" | null | undefined;
}

export function BudgetFields({ value, onChange, error, errorField }: BudgetFieldsProps) {
  const validStart = isValidISODate(value.startDate);
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budget-amount">Presupuesto semanal para comida</Label>
          <MoneyInput
            id="budget-amount"
            value={value.amount}
            onChange={(amount) => onChange({ ...value, amount })}
            invalid={errorField === "amount"}
            describedBy={errorField === "amount" ? "budget-error" : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget-start">Fecha de inicio</Label>
          <Input
            id="budget-start"
            type="date"
            value={value.startDate}
            aria-invalid={errorField === "startDate"}
            aria-describedby={errorField === "startDate" ? "budget-error" : "budget-range"}
            onChange={(event) => onChange({ ...value, startDate: event.target.value })}
          />
        </div>
      </div>
      <p id="budget-range" className="flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2.5 text-sm text-foreground">
        <CalendarRange className="size-4 text-primary" aria-hidden="true" />
        {validStart
          ? `Cubre 7 días: del ${formatLongDate(value.startDate)} al ${formatLongDate(weeklyEndDate(value.startDate))}.`
          : "Elige la fecha de inicio para ver el período."}
      </p>
      <FieldError id="budget-error" message={error} />
    </div>
  );
}

/** Maps a service error code to the field to highlight. */
export function budgetErrorField(code: string | undefined): "amount" | "startDate" | null {
  if (code === "AMOUNT_NOT_POSITIVE" || code === "AMOUNT_NOT_INTEGER") return "amount";
  if (code === "INVALID_DATE" || code === "OVERLAP") return "startDate";
  return null;
}
