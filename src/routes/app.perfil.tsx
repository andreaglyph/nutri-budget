import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryError, QueryNotFound } from "@/components/common/QueryError";
import { ProfileFields } from "@/components/profile/ProfileFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { validateProfile, type ProfileInput, type ProfileValidationError } from "@/domain/rules/profile";
import { authService } from "@/services/auth.service";
import { resetDb } from "@/services/db";
import { profileService } from "@/services/profile.service";
import { pageHead } from "@/lib/seo";
import { useUpdateProfile } from "@/state/mutations";
import { catalogQuery, profileQuery, useCatalog, useUserId } from "@/state/queries";

export const Route = createFileRoute("/app/perfil")({
  head: () => pageHead("Perfil y preferencias", "Tu hogar, preferencias, restricciones y exclusiones alimentarias.", { private: true }),
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(catalogQuery()), context.queryClient.ensureQueryData(profileQuery(context.session.userId))]); },
  errorComponent: QueryError, notFoundComponent: QueryNotFound,
  component: ProfilePage,
});
function ProfilePage() {
  const userId = useUserId();
  const { catalog } = useCatalog();
  const { data: details } = useSuspenseQuery(profileQuery(userId));
  const save = useUpdateProfile(userId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ProfileInput>(() => ({ name: details.user.name, householdSize: details.profile.householdSize, plannedMealTypes: details.profile.plannedMealTypes, preferenceTagIds: details.preferenceTagIds, restrictionTagIds: details.restrictionTagIds, allergyTagIds: details.allergyTagIds, excludedIngredientIds: details.excludedIngredientIds }));
  const [error, setError] = useState<ProfileValidationError | null>(null);
  const [confirmation, setConfirmation] = useState<"delete-first" | "delete-final" | "reset" | null>(null);
  const [phrase, setPhrase] = useState("");
  const accountAction = useMutation({
    mutationFn: async (action: "delete" | "reset") => {
      if (action === "delete") await profileService.deleteAccount(userId);
      else resetDb();
      authService.logout();
    },
    onSuccess: async (_, action) => {
      queryClient.clear();
      setConfirmation(null);
      toast.success(action === "delete" ? "Cuenta eliminada en este navegador" : "Datos de demostración restaurados");
      await navigate({ to: "/ingresar", search: { redirect: undefined } });
    },
    onError: e => toast.error(e.message),
  });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validateProfile(draft);
    setError(invalid);
    if (invalid) return;
    try { await save.mutateAsync(draft); toast.success("Perfil actualizado"); } catch (e) { toast.error(e instanceof Error ? e.message : "No pudimos guardar tu perfil."); }
  };
  return <>
    <PageHeader eyebrow="Cuenta" title="Perfil y preferencias" description={details.user.email} />
    <form onSubmit={submit} className="max-w-3xl space-y-8"><ProfileFields value={draft} onChange={setDraft} tags={catalog.dietaryTags} ingredients={catalog.ingredients} error={error} /><Button type="submit" disabled={save.isPending}>{save.isPending ? <Loader2 className="animate-spin" /> : <Save />} Guardar cambios</Button></form>
    <section className="mt-10 max-w-3xl border-t border-border pt-6"><h2 className="font-display text-lg font-bold">Datos de demostración</h2><p className="mt-2 text-sm text-muted-foreground">Restaurar elimina los cambios y las cuentas creadas en este navegador. Volverán los datos originales de Laura y se cerrará tu sesión.</p><Button variant="outline" className="mt-4" onClick={() => setConfirmation("reset")}><RotateCcw /> Restaurar demostración</Button></section>
    <section className="mt-8 max-w-3xl border-t border-border pt-6"><h2 className="font-display text-lg font-bold text-destructive">Eliminar cuenta</h2><p className="mt-2 text-sm text-muted-foreground">Se eliminarán tu cuenta y sus datos en este navegador. Esta acción no se puede deshacer.</p><Button variant="destructive" className="mt-4" onClick={() => { setPhrase(""); setConfirmation("delete-first"); }}><Trash2 /> Eliminar mi cuenta</Button></section>
    <AlertDialog open={confirmation !== null} onOpenChange={open => { if (!open && !accountAction.isPending) setConfirmation(null); }}><AlertDialogContent><AlertDialogHeader>
      <AlertDialogTitle>{confirmation === "reset" ? "¿Restaurar la demostración?" : confirmation === "delete-final" ? "Confirma la eliminación definitiva" : "¿Eliminar tu cuenta?"}</AlertDialogTitle>
      <AlertDialogDescription>{confirmation === "reset" ? "Se perderán todos los cambios y cuentas locales y se cerrará la sesión." : "Se eliminarán tus datos personales, preferencias, presupuestos, inventario y compras de este navegador."}</AlertDialogDescription>
    </AlertDialogHeader>
      {confirmation === "delete-final" && <div className="space-y-2"><Label htmlFor="delete-confirm">Escribe ELIMINAR para confirmar</Label><Input id="delete-confirm" value={phrase} onChange={e => setPhrase(e.target.value)} autoComplete="off" /></div>}
      <AlertDialogFooter><AlertDialogCancel disabled={accountAction.isPending}>Cancelar</AlertDialogCancel>
        {confirmation === "delete-first" ? <Button variant="destructive" onClick={() => setConfirmation("delete-final")}>Continuar con la eliminación</Button> : <Button variant={confirmation === "reset" ? "default" : "destructive"} disabled={accountAction.isPending || (confirmation === "delete-final" && phrase !== "ELIMINAR")} onClick={() => accountAction.mutate(confirmation === "reset" ? "reset" : "delete")}>{accountAction.isPending && <Loader2 className="animate-spin" />}{confirmation === "reset" ? "Restaurar datos" : "Eliminar definitivamente"}</Button>}
      </AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
