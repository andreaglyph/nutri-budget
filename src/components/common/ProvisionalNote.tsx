import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ProvisionalNoteProps {
  children: ReactNode;
  label?: string | undefined;
  className?: string | undefined;
}

/**
 * Marks behaviour that depends on a pending business decision from the audit.
 * Keeps provisional rules visible instead of presenting them as final.
 */
export function ProvisionalNote({ children, label = "Provisional", className }: ProvisionalNoteProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg bg-highlight-soft px-3 py-2 text-xs text-highlight-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">{label}: </strong>
        {children}
      </span>
    </p>
  );
}

/** Reminder that demo prices are example estimates, not real quotes. */
export function EstimatedPriceNote({ className }: { className?: string | undefined }) {
  return (
    <ProvisionalNote label="Precios de ejemplo" className={className}>
      son estimaciones de demostración, no cotizaciones reales de supermercados.
    </ProvisionalNote>
  );
}
