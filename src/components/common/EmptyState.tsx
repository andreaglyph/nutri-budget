import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, children, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border-strong bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {children}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </section>
  );
}
