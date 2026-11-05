import { Check, Hammer } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { PageHeader } from "./PageHeader";

interface StagePlaceholderProps {
  eyebrow?: string | undefined;
  title: string;
  description: string;
  stage: number;
  upcoming: string[];
}

/** Placeholder for a module whose screens arrive in a later build stage. */
export function StagePlaceholder({ eyebrow, title, description, stage, upcoming }: StagePlaceholderProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="surface-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-surface-sunken px-5 py-4">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
            <Hammer className="size-4" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Módulo en construcción</p>
            <p className="text-xs text-muted-foreground">La estructura y la navegación ya funcionan.</p>
          </div>
          <Badge variant="warning">Etapa {stage}</Badge>
        </div>
        <ul className="grid gap-3 p-5 sm:grid-cols-2">
          {upcoming.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
