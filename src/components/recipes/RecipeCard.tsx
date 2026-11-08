import { Link } from "@tanstack/react-router";
import { Clock, ShieldAlert, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RecipeDetail } from "@/domain/models";
import { formatCOP } from "@/domain/rules/format";
import { MEAL_TYPE_LABELS } from "@/domain/rules/recipes";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: RecipeDetail;
  cost: number;
  servings: number;
  compatible: boolean;
  suitableLabels: string[];
}

export function RecipeCard({ recipe, cost, servings, compatible, suitableLabels }: RecipeCardProps) {
  return (
    <Link
      to="/app/recetas/$recipeId"
      params={{ recipeId: recipe.id }}
      className={cn(
        "group surface-card flex flex-col overflow-hidden transition-shadow hover:shadow-raised focus-visible:shadow-raised",
        !compatible && "opacity-80",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          loading="lazy"
          width={640}
          height={480}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {recipe.mealTypes.map((meal) => (
            <Badge key={meal} variant="outline" className="border-transparent bg-card/95 text-foreground">
              {MEAL_TYPE_LABELS[meal]}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary-strong">{recipe.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
        {!compatible && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <ShieldAlert className="size-3.5" aria-hidden="true" /> No es compatible con tu perfil
          </p>
        )}
        {compatible && suitableLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suitableLabels.slice(0, 3).map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4 text-sm">
          <span className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-4" aria-hidden="true" /> {recipe.prepMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" aria-hidden="true" /> {servings}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-[11px] text-muted-foreground">Costo estimado</span>
            <span className="font-semibold text-foreground tabular">{formatCOP(cost)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
