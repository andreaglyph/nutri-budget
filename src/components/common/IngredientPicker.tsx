import { ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ID, Ingredient } from "@/domain/models";
import { cn } from "@/lib/utils";

interface IngredientPickerProps {
  id?: string | undefined;
  ingredients: readonly Ingredient[];
  value?: ID | undefined;
  onSelect: (ingredient: Ingredient) => void;
  placeholder?: string;
  hiddenIds?: readonly ID[];
  invalid?: boolean;
  className?: string;
}

/** Searchable ingredient selector grouped by category. */
export function IngredientPicker({ id, ingredients, value, onSelect, placeholder = "Buscar ingrediente", hiddenIds = [], invalid, className }: IngredientPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = ingredients.find((ingredient) => ingredient.id === value);
  const groups = useMemo(() => {
    const hidden = new Set(hiddenIds);
    const map = new Map<string, Ingredient[]>();
    for (const ingredient of ingredients) {
      if (hidden.has(ingredient.id)) continue;
      map.set(ingredient.category, [...(map.get(ingredient.category) ?? []), ingredient]);
    }
    return [...map.entries()];
  }, [ingredients, hiddenIds]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground", invalid && "border-destructive", className)}
        >
          <span className="truncate">{selected?.name ?? placeholder}</span>
          <ChevronsUpDown className="opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Escribe para buscar…" />
          <CommandList>
            <CommandEmpty>No encontramos ese ingrediente.</CommandEmpty>
            {groups.map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((ingredient) => (
                  <CommandItem
                    key={ingredient.id}
                    value={`${ingredient.name} ${ingredient.category}`}
                    onSelect={() => {
                      onSelect(ingredient);
                      setOpen(false);
                    }}
                  >
                    {ingredient.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
