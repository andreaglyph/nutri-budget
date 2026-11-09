import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, MoreVertical, PackageX, Plus, Refrigerator, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { BatchFields, EMPTY_BATCH, draftFromBatch, draftToInput, type BatchDraft } from "@/components/inventory/BatchFields";
import { daysLabel, ExpiryBadge } from "@/components/inventory/ExpiryBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserInventory } from "@/domain/models";
import { formatShortDate, todayISO } from "@/domain/rules/dates";
import { batchStatus, daysUntilBestBefore, inventoryOverview, sortByBestBefore, type BatchStatus } from "@/domain/rules/inventory";
import { normalize } from "@/domain/rules/recipes";
import { formatQuantity } from "@/domain/rules/units";
import { pageHead } from "@/lib/seo";
import { ApiError } from "@/services/simulated-api";
import { useBatchAction, useSaveBatch } from "@/state/mutations";
import { catalogQuery, inventoryQuery, useCatalog, useUserId } from "@/state/queries";

export const Route = createFileRoute("/app/inventario")({
  head: () => pageHead("Mi inventario", "Lotes de ingredientes en casa, ordenados por fecha de vencimiento.", { private: true }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQuery());
    context.queryClient.ensureQueryData(inventoryQuery(context.session.userId));
  },
  component: InventoryPage,
});

type TabKey = "available" | "expiring" | "depleted";
const TAB_STATUSES: Record<TabKey, BatchStatus[]> = {
  available: ["AVAILABLE", "EXPIRING"],
  expiring: ["EXPIRING", "EXPIRED"],
  depleted: ["DEPLETED"],
};

function InventoryPage() {
  const userId = useUserId();
  const today = todayISO();
  const { catalog, index } = useCatalog();
  const { data: inventory } = useSuspenseQuery(inventoryQuery(userId));
  const save = useSaveBatch(userId);
  const action = useBatchAction(userId);

  const [tab, setTab] = useState<TabKey>("available");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"date" | "name">("date");
  const [editing, setEditing] = useState<{ id?: string; draft: BatchDraft } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<UserInventory | null>(null);

  const overview = inventoryOverview(inventory, today);

  const groups = useMemo(() => {
    const statuses = TAB_STATUSES[tab];
    const needle = normalize(query);
    const visible = inventory.filter((batch) => {
      const ingredient = index.ingredientsById.get(batch.ingredientId);
      if (!ingredient) return false;
      if (!statuses.includes(batchStatus(batch, today))) return false;
      if (category !== "all" && ingredient.category !== category) return false;
      return !needle || normalize(ingredient.name).includes(needle);
    });
    const map = new Map<string, UserInventory[]>();
    for (const batch of sortByBestBefore(visible)) map.set(batch.ingredientId, [...(map.get(batch.ingredientId) ?? []), batch]);
    const list = [...map.entries()];
    if (sort === "name") list.sort((a, b) => (index.ingredientsById.get(a[0])?.name ?? "").localeCompare(index.ingredientsById.get(b[0])?.name ?? "", "es"));
    return list;
  }, [inventory, tab, query, category, sort, index, today]);

  const submit = async () => {
    if (!editing) return;
    try {
      await save.mutateAsync({ id: editing.id, input: draftToInput(editing.draft) });
      toast.success(editing.id ? "Lote actualizado" : "Lote agregado a tu inventario");
      setEditing(null);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "No pudimos guardar el lote.");
    }
  };

  const run = async (batch: UserInventory, kind: "deplete" | "remove") => {
    await action.mutateAsync({ id: batch.id, action: kind });
    toast.success(kind === "deplete" ? "Lote marcado como agotado" : "Lote eliminado");
  };

  return (
    <>
      <PageHeader
        eyebrow="Inventario"
        title="Mi inventario"
        description="Cada compra o registro es un lote con su propia fecha. Primero se usa lo que vence antes."
        actions={
          <Button
            onClick={() => {
              setFormError(null);
              setEditing({ draft: EMPTY_BATCH });
            }}
          >
            <Plus /> Agregar lote
          </Button>
        }
      />

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Disponibles", overview.available],
          ["Por consumir pronto", overview.expiringSoon],
          ["Vencidos", overview.expired],
          ["Agotados", overview.depleted],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold text-foreground tabular">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
          <TabsList>
            <TabsTrigger value="available">Disponibles</TabsTrigger>
            <TabsTrigger value="expiring">Por consumir</TabsTrigger>
            <TabsTrigger value="depleted">Agotados</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Buscar ingrediente" placeholder="Buscar ingrediente" className="pl-9 sm:w-56" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filtrar por categoría" className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {index.categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as "date" | "name")}>
            <SelectTrigger aria-label="Ordenar" className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Vence primero</SelectItem>
              <SelectItem value="name">Nombre (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5">
        {inventory.length === 0 ? (
          <EmptyState
            icon={Refrigerator}
            title="Tu inventario está vacío"
            description="Registra lo que tienes en casa para usarlo primero y no comprarlo de nuevo."
            action={<Button onClick={() => setEditing({ draft: EMPTY_BATCH })}>Agregar lote</Button>}
          />
        ) : groups.length === 0 ? (
          <EmptyState icon={PackageX} title="No hay lotes en esta vista" description="Prueba con otra pestaña, categoría o búsqueda." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {groups.map(([ingredientId, batches]) => {
              const ingredient = index.ingredientsById.get(ingredientId);
              if (!ingredient) return null;
              return (
                <li key={ingredientId} className="surface-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border bg-surface-sunken px-4 py-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{ingredient.name}</h3>
                      <p className="text-xs text-muted-foreground">{ingredient.category}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {batches.length} {batches.length === 1 ? "lote" : "lotes"}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {batches.map((batch) => (
                      <li key={batch.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground tabular">{formatQuantity(batch.quantity, ingredient.baseUnit)}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysLabel(daysUntilBestBefore(batch.bestBefore, today))}
                            {batch.bestBefore && ` · ${formatShortDate(batch.bestBefore)}`}
                          </p>
                        </div>
                        <ExpiryBadge status={batchStatus(batch, today)} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Acciones del lote de ${ingredient.name}`}>
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                setFormError(null);
                                setEditing({ id: batch.id, draft: draftFromBatch(batch, ingredient) });
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                            {batch.quantity > 0 && <DropdownMenuItem onSelect={() => run(batch, "deplete")}>Marcar como agotado</DropdownMenuItem>}
                            <DropdownMenuItem className="text-destructive" onSelect={() => setToDelete(batch)}>
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar lote" : "Agregar lote"}</DialogTitle>
            <DialogDescription>La cantidad se guarda en la unidad base del ingrediente.</DialogDescription>
          </DialogHeader>
          {editing && (
            <BatchFields
              idPrefix="batch"
              value={editing.draft}
              onChange={(draft) => setEditing({ ...editing, draft })}
              ingredients={catalog.ingredients}
              error={formError}
              lockIngredient={!!editing.id}
            />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />} Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este lote?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará {toDelete ? index.ingredientsById.get(toDelete.ingredientId)?.name : ""} de tu inventario. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) void run(toDelete, "remove");
                setToDelete(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
