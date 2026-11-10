import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function QueryError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const boundary = useQueryErrorResetBoundary();
  return <div role="alert" className="space-y-4 py-8"><h1 className="text-title">No pudimos cargar tus datos</h1><p className="text-muted-foreground">{error instanceof Error ? error.message : "Intenta cargar la página de nuevo."}</p><Button onClick={() => { boundary.reset(); void router.invalidate(); }}>Reintentar</Button></div>;
}
export function QueryNotFound() {
  return <div className="py-8"><h1 className="text-title">No encontramos esta página</h1></div>;
}
