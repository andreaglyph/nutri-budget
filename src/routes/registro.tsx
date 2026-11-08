import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FieldError } from "@/components/common/FieldError";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHead } from "@/lib/seo";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/simulated-api";

export const Route = createFileRoute("/registro")({
  head: () => pageHead("Crear cuenta", "Crea tu cuenta de NutriBudget y configura tu hogar en tres pasos."),
  component: RegisterPage,
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Escribe tu nombre (mínimo 2 letras).").max(60, "Usa máximo 60 caracteres."),
    email: z.string().trim().min(1, "Escribe tu correo electrónico.").email("Revisa el formato del correo, por ejemplo nombre@correo.com.").max(120),
    password: z
      .string()
      .min(8, "Usa al menos 8 caracteres.")
      .regex(/[A-Za-z]/, "Incluye al menos una letra.")
      .regex(/\d/, "Incluye al menos un número."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    acceptTerms: z.boolean().refine((value) => value, "Debes aceptar los términos y condiciones."),
    acceptDataProcessing: z.boolean().refine((value) => value, "Debes autorizar el tratamiento de tus datos personales."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });
type RegisterValues = z.infer<typeof registerSchema>;

const STEPS = ["Crea tu cuenta", "Cuéntanos sobre tu hogar", "Define tu presupuesto", "Registra lo que tienes en casa"];

function RegisterPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", acceptTerms: false, acceptDataProcessing: false },
  });

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null);
    try {
      const session = await authService.register(values);
      toast.success(`¡Bienvenida, ${session.name.split(" ")[0]}!`, { description: "Ahora configuremos tu hogar." });
      navigate({ to: "/onboarding" });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "No pudimos crear tu cuenta. Intenta de nuevo.");
    }
  };

  const textField = (name: "name" | "email" | "password" | "confirmPassword", label: string, type: string, autoComplete: string) => (
    <div className="space-y-2">
      <Label htmlFor={`register-${name}`}>{label}</Label>
      <Input
        id={`register-${name}`}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `register-${name}-error` : undefined}
        {...register(name)}
      />
      <FieldError id={`register-${name}-error`} message={errors[name]?.message} />
    </div>
  );

  return (
    <PublicLayout>
      <div className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <section aria-labelledby="register-title" className="max-w-lg">
          <h1 id="register-title" className="text-title text-foreground">Crea tu cuenta</h1>
          <p className="mt-2 text-muted-foreground">En pocos minutos tendrás tu presupuesto y tu despensa organizados.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            {formError && (
              <p role="alert" className="rounded-lg bg-destructive-soft px-3 py-2.5 text-sm text-destructive">
                {formError}
              </p>
            )}
            {textField("name", "Nombre", "text", "name")}
            {textField("email", "Correo electrónico", "email", "email")}
            <div className="grid gap-5 sm:grid-cols-2">
              {textField("password", "Contraseña", "password", "new-password")}
              {textField("confirmPassword", "Confirmar contraseña", "password", "new-password")}
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">Mínimo 8 caracteres, con letras y números.</p>

            <div className="space-y-4 rounded-xl bg-surface-sunken p-4">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field }) => (
                  <div className="space-y-1">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="register-terms"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        onBlur={field.onBlur}
                        aria-invalid={!!errors.acceptTerms}
                        aria-describedby={errors.acceptTerms ? "register-terms-error" : undefined}
                        className="mt-0.5"
                      />
                      <Label htmlFor="register-terms" className="text-sm font-normal leading-snug">
                        Acepto los{" "}
                        <Link to="/terminos" target="_blank" className="font-semibold text-primary hover:underline">
                          términos y condiciones
                        </Link>
                      </Label>
                    </div>
                    <FieldError id="register-terms-error" message={errors.acceptTerms?.message} />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="acceptDataProcessing"
                render={({ field }) => (
                  <div className="space-y-1">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="register-data"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        onBlur={field.onBlur}
                        aria-invalid={!!errors.acceptDataProcessing}
                        aria-describedby={errors.acceptDataProcessing ? "register-data-error" : undefined}
                        className="mt-0.5"
                      />
                      <Label htmlFor="register-data" className="text-sm font-normal leading-snug">
                        Autorizo el tratamiento de mis datos personales según la{" "}
                        <Link to="/privacidad" target="_blank" className="font-semibold text-primary hover:underline">
                          política de privacidad
                        </Link>
                      </Label>
                    </div>
                    <FieldError id="register-data-error" message={errors.acceptDataProcessing?.message} />
                  </div>
                )}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Creando tu cuenta…" : "Crear cuenta"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Prototipo: la cuenta se guarda solo en este navegador. No uses una contraseña real.
            </p>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/ingresar" className="font-semibold text-primary hover:underline">
              Ingresa aquí
            </Link>
          </p>
        </section>

        <aside className="hidden rounded-3xl bg-secondary p-8 lg:block" aria-label="Pasos para empezar">
          <p className="text-eyebrow text-primary">Así empiezas</p>
          <ol className="mt-6 space-y-5">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card font-display text-sm font-bold text-primary-strong">
                  {index === 0 ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className="font-medium text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </PublicLayout>
  );
}
