import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Loader2, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Session, UserRole } from "@/domain/models";
import { pageHead } from "@/lib/seo";
import { DEMO_ACCOUNTS } from "@/mocks/users";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/simulated-api";

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/ingresar")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const value = search["redirect"];
    return typeof value === "string" ? { redirect: value } : {};
  },
  head: () => pageHead("Ingresar", "Ingresa a NutriBudget para planear tus comidas de la semana."),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "Escribe tu correo electrónico.").email("Revisa el formato del correo, por ejemplo nombre@correo.com."),
  password: z.string().min(1, "Escribe tu contraseña."),
});
type LoginValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const goToWorkspace = (session: Session) => {
    toast.success(`Hola, ${session.name.split(" ")[0]}`, { description: "Ingresaste con una cuenta de demostración." });
    if (!session.onboardingCompleted) {
      navigate({ to: "/onboarding" });
      return;
    }
    const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
    if (safeRedirect && !(safeRedirect.startsWith("/admin") && session.role !== "ADMIN")) {
      router.history.push(safeRedirect);
      return;
    }
    navigate({ to: session.role === "ADMIN" ? "/admin" : "/app" });
  };

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      goToWorkspace(await authService.login(values.email, values.password));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "No pudimos iniciar sesión. Intenta de nuevo.");
    }
  };

  const enterDemo = async (role: UserRole) => {
    setDemoLoading(role);
    try {
      goToWorkspace(await authService.loginAsDemo(role));
    } finally {
      setDemoLoading(null);
    }
  };

  const userDemo = DEMO_ACCOUNTS.find((account) => account.role === "USER");

  return (
    <PublicLayout>
      <div className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <section aria-labelledby="login-title" className="max-w-md">
          <h1 id="login-title" className="text-title text-foreground">Ingresa a tu cuenta</h1>
          <p className="mt-2 text-muted-foreground">Continúa con la planificación de tu semana.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            {formError && (
              <p role="alert" className="rounded-lg bg-destructive-soft px-3 py-2.5 text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <span className="text-xs text-muted-foreground" title="La recuperación de contraseña está pendiente de aprobación.">
                  ¿Olvidaste tu contraseña? <span className="font-semibold">Próximamente</span>
                </span>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold text-primary hover:underline">
              Crea una aquí
            </Link>
          </p>
        </section>

        <aside aria-labelledby="demo-title" className="rounded-3xl bg-secondary p-6 md:p-8">
          <p className="text-eyebrow text-primary">Prototipo</p>
          <h2 id="demo-title" className="mt-2 text-xl font-bold text-foreground">Explora con una cuenta de demostración</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Los datos son ficticios y se guardan solo en este navegador.
          </p>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => enterDemo("USER")}
              disabled={demoLoading !== null}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
            >
              <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
                {demoLoading === "USER" ? <Loader2 className="size-5 animate-spin" /> : <UserRound className="size-5" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-foreground">Entrar como usuario demo</span>
                <span className="block text-sm text-muted-foreground">Laura · hogar de 2 personas</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => enterDemo("ADMIN")}
              disabled={demoLoading !== null}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
            >
              <span className="grid size-10 place-items-center rounded-full bg-highlight-soft text-highlight-foreground">
                {demoLoading === "ADMIN" ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-foreground">Entrar como administrador demo</span>
                <span className="block text-sm text-muted-foreground">Gestión de recetas, ingredientes y precios</span>
              </span>
            </button>
          </div>
          {userDemo && (
            <p className="mt-6 text-xs text-muted-foreground">
              También puedes escribir <span className="font-semibold text-foreground">{userDemo.email}</span> con la
              contraseña <span className="font-semibold text-foreground">{userDemo.password}</span>.
            </p>
          )}
        </aside>
      </div>
    </PublicLayout>
  );
}
