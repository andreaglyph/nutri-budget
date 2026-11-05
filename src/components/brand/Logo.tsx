import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  tone?: "default" | "inverse";
}

/** NutriBudget mark: a leaf (food) resting on a coin (budget). */
export function Logo({ className, showWordmark = true, tone = "default" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0">
        <rect width="32" height="32" rx="9" className={tone === "inverse" ? "fill-card" : "fill-primary"} />
        <circle cx="21.5" cy="21.5" r="5" className="fill-highlight" />
        <path
          d="M8.5 22.5c0-8 5.5-13 14-13.5-.3 8.6-5.4 13.9-13.2 14.2"
          className={tone === "inverse" ? "fill-primary" : "fill-primary-foreground"}
        />
        <path
          d="M9.5 22.3c2.8-3.6 6-6.3 9.6-8.3"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          className={tone === "inverse" ? "stroke-card" : "stroke-primary"}
        />
      </svg>
      {showWordmark && (
        <span
          className={cn(
            "font-display text-lg font-extrabold tracking-tight",
            tone === "inverse" ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Nutri<span className={tone === "inverse" ? "text-highlight" : "text-primary"}>Budget</span>
        </span>
      )}
    </span>
  );
}
