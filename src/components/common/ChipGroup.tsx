import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onChange: (next: T[]) => void;
  tone?: "primary" | "danger";
  describedBy?: string | undefined;
}

/** Multi-select chips rendered as toggle buttons (keyboard accessible). */
export function ChipGroup<T extends string>({ label, options, selected, onChange, tone = "primary", describedBy }: ChipGroupProps<T>) {
  const toggle = (value: T) =>
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

  return (
    <div role="group" aria-label={label} aria-describedby={describedBy} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              !active && "border-border-strong bg-card text-foreground hover:bg-secondary",
              active && tone === "primary" && "border-primary bg-secondary text-primary-strong",
              active && tone === "danger" && "border-destructive bg-destructive-soft text-destructive",
            )}
          >
            {active && <Check className="size-3.5" aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
