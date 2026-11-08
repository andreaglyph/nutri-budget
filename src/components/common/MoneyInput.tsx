import { Input } from "@/components/ui/input";

interface MoneyInputProps {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  invalid?: boolean;
  describedBy?: string | undefined;
}

/** Whole-peso amount input that shows Colombian thousand separators while typing. */
export function MoneyInput({ id, value, onChange, invalid, describedBy }: MoneyInputProps) {
  const display = value === null ? "" : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">$</span>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className="pl-7 pr-14 tabular"
        value={display}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(digits ? Number(digits) : null);
        }}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">COP</span>
    </div>
  );
}
