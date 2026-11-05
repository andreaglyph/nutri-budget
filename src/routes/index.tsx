import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Minus,
  Receipt,
  Refrigerator,
  ShoppingBasket,
  Wallet,
} from "lucide-react";

import heroImage from "@/assets/hero-table.jpg";
import pantryImage from "@/assets/pantry.jpg";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCOP } from "@/domain/rules/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriBudget · Planea tus comidas con tu presupuesto y lo que tienes en casa" },
      {
        name: "description",
        content:
          "NutriBudget arma tu menú semanal según tu presupuesto, tu despensa y tus preferencias, y te deja una lista de compras con solo lo que falta.",
      },
      { property: "og:title", content: "NutriBudget · Alimentación inteligente, saludable y económica" },
      {
        property: "og:description",
        content: "Menú semanal según tu presupuesto e ingredientes disponibles. Compra solo lo necesario.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const STEPS = [
  {
    icon: Wallet,
    title: "Define tu presupuesto",
    text: "Cuánto puedes gastar en comida esta semana y para cuántas personas.",
  },
  {
    icon: Refrigerator,
    title: "Registra tu despensa",
    text: "Lo que ya tienes y cuándo conviene consumirlo. Puedes omitirlo y hacerlo después.",
  },
  {
    icon: CalendarDays,
    title: "Genera tu menú",
    text: "Desayunos, almuerzos y cenas que respetan tus alergias, restricciones y gustos.",
  },
  {
    icon: ShoppingBasket,
    title: "Compra solo lo que falta",
    text: "Una lista agrupada por ingrediente y, al volver del mercado, registras lo que pagaste.",
  },
];

const BEFORE = [
  "Llegas al mercado sin saber cuánto vas a gastar.",
  "Compras arroz y ya tenías medio paquete en la alacena.",
  "La espinaca se dañó porque nadie se acordó de ella.",
  "La receta que viste en internet no cabe en tu bolsillo.",
];

const AFTER = [
  "Ves el costo estimado de la semana antes de salir.",
  "La lista descuenta lo que ya tienes en casa.",
  "El menú usa primero lo que vence antes.",
  "Las recetas se eligen dentro de tu presupuesto.",
];

const FEATURES = [
  { icon: Wallet, title: "Presupuesto semanal", text: "Saldo disponible, porcentaje usado y diferencia entre lo estimado y lo real." },
  { icon: Refrigerator, title: "Inventario por lotes", text: "Varias fechas de consumo para un mismo ingrediente, en gramos, mililitros o unidades." },
  { icon: BookOpen, title: "Recetario colombiano", text: "Arepa con huevo, lentejas, sudado de pollo, crema de ahuyama y más, con costo estimado." },
  { icon: CalendarDays, title: "Planificador semanal", text: "Calendario por días y comidas. Cambia una receta por otra o regenera el menú." },
  { icon: ShoppingBasket, title: "Lista de compras", text: "Cada ingrediente aparece una sola vez, con lo que necesitas, lo que tienes y lo que falta." },
  { icon: Receipt, title: "Seguimiento de gastos", text: "Registra lo que pagaste de verdad y compáralo con tu presupuesto." },
];

const AUDIENCES = ["Estudiantes", "Personas que viven solas", "Jóvenes independientes", "Familias y hogares", "Quienes quieren ordenar sus gastos", "Quienes quieren desperdiciar menos"];

function HomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="container-page grid items-center gap-12 pb-16 pt-10 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:pb-24">
        <div>
          <p className="text-eyebrow text-primary">Planificación de comidas para hogares en Colombia</p>
          <h1 className="text-display mt-4 text-foreground">
            Planea tus comidas con lo que tienes en casa y lo que{" "}
            <span className="relative whitespace-nowrap text-primary">
              puedes gastar
              <svg aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full">
                <path d="M2 9c50-6 120-8 196-4" strokeWidth="4" strokeLinecap="round" fill="none" className="stroke-highlight" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            NutriBudget arma tu menú de la semana según tu presupuesto, los ingredientes de tu despensa y tus
            preferencias. Al final te deja una lista de compras con solo lo que falta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/registro">
                Crear mi cuenta <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/ingresar">Probar con la cuenta demo</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Valores en pesos colombianos", "Inventario opcional", "Sin pagos ni tarjetas"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-primary" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <img
            src={heroImage}
            alt="Mesa con arepa con huevo, lentejas, aguacate, tomates y una lista de mercado escrita a mano"
            width={1600}
            height={1104}
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-raised"
          />

          <div className="absolute -left-3 top-6 w-60 rounded-2xl border border-border bg-card p-4 shadow-overlay sm:-left-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Presupuesto de la semana</p>
              <Badge variant="neutral">Ejemplo</Badge>
            </div>
            <p className="tabular mt-1 font-display text-xl font-extrabold text-foreground">{formatCOP(150000)}</p>
            <Progress value={58} className="mt-3 h-2 bg-secondary" aria-label="58 % del presupuesto estimado" />
            <p className="mt-2 text-xs text-muted-foreground">
              Compras estimadas: <span className="tabular font-semibold text-foreground">{formatCOP(87200)}</span>
            </p>
          </div>

          <div className="absolute -bottom-6 right-3 w-64 rounded-2xl border border-border bg-card p-4 shadow-overlay sm:-right-6">
            <p className="text-xs font-semibold text-muted-foreground">Usa primero</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-foreground">Espinaca · 250 g</span>
                <Badge variant="warning">2 días</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Tomate · 4 und</span>
                <Badge variant="warning">3 días</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Ahuyama · 800 g</span>
                <Badge variant="success">6 días</Badge>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Central question */}
      <section className="border-y border-border bg-card">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1.3fr_1fr] md:py-20">
          <blockquote className="font-display text-2xl font-bold leading-snug tracking-tight text-foreground md:text-3xl">
            “¿Cómo organizo las comidas de mi semana, aprovecho lo que ya tengo y compro solo lo necesario sin pasarme
            del presupuesto?”
          </blockquote>
          <p className="self-end text-muted-foreground">
            NutriBudget conecta cuatro cosas que normalmente se manejan por separado: tu <strong className="text-foreground">presupuesto</strong>,
            tu <strong className="text-foreground">inventario</strong>, tu <strong className="text-foreground">menú</strong> y tu{" "}
            <strong className="text-foreground">lista de compras</strong>.
          </p>
        </div>
      </section>

      {/* Before / after */}
      <section className="container-page py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-primary">Lo que cambia</p>
          <h2 className="text-title mt-2 text-foreground">Menos improvisación en la cocina y en el mercado</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-surface-sunken p-6 md:p-8">
            <p className="text-sm font-semibold text-muted-foreground">Lo que suele pasar</p>
            <ul className="mt-4 space-y-4">
              {BEFORE.map((item) => (
                <li key={item} className="flex gap-3 text-foreground">
                  <Minus className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-secondary p-6 md:p-8">
            <p className="text-sm font-semibold text-primary-strong">Con NutriBudget</p>
            <ul className="mt-4 space-y-4">
              {AFTER.map((item) => (
                <li key={item} className="flex gap-3 text-foreground">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="scroll-mt-20 bg-card py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-primary">Cómo funciona</p>
            <h2 className="text-title mt-2 text-foreground">Cuatro pasos, de tu presupuesto a la lista del mercado</h2>
          </div>
          <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="tabular font-display text-sm font-bold text-muted-foreground">0{index + 1}</span>
                    {index < STEPS.length - 1 && (
                      <span aria-hidden="true" className="hidden h-px flex-1 bg-border-strong lg:block" />
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="container-page scroll-mt-20 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-eyebrow text-primary">Funcionalidades</p>
            <h2 className="text-title mt-2 text-foreground">Todo lo que necesitas para la semana, conectado</h2>
            <p className="mt-4 text-muted-foreground">
              Cada módulo usa la misma información: si cambias una receta del menú, la lista de compras y el
              costo estimado se actualizan.
            </p>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex gap-5 py-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Use what you have */}
      <section id="aprovechar" className="scroll-mt-20 border-y border-border bg-secondary/60 py-16 md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <img
            src={pantryImage}
            alt="Despensa con frascos de arroz, lentejas, fríjoles y avena, y una canasta con ahuyama, zanahorias y cebollas"
            width={1200}
            height={1200}
            loading="lazy"
            className="aspect-square w-full max-w-lg rounded-3xl object-cover lg:max-w-none"
          />
          <div>
            <p className="text-eyebrow text-primary">Ahorro y aprovechamiento</p>
            <h2 className="text-title mt-2 text-foreground">Lo que ya tienes se usa primero. Lo que compras, una sola vez.</h2>
            <p className="mt-4 text-muted-foreground">
              Antes de armar la lista, NutriBudget suma lo que necesita todo el menú por ingrediente y descuenta tu
              inventario una sola vez, empezando por los lotes que vencen antes.
            </p>

            <figure className="mt-8 surface-card p-5">
              <figcaption className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Arroz para la semana</span>
                <Badge variant="neutral">Ejemplo</Badge>
              </figcaption>
              <dl className="tabular mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Arroz con pollo (martes)</dt>
                  <dd>600 g</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Arroz con huevo (jueves)</dt>
                  <dd>600 g</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                  <dt>Necesitas en total</dt>
                  <dd>1,2 kg</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Tienes en casa</dt>
                  <dd>− 500 g</dd>
                </div>
                <div className="flex justify-between rounded-lg bg-secondary px-3 py-2 font-semibold text-primary-strong">
                  <dt>Va a la lista de compras</dt>
                  <dd>700 g</dd>
                </div>
              </dl>
            </figure>
          </div>
        </div>
      </section>

      {/* Audience + CTA */}
      <section className="container-page py-16 md:py-24">
        <div className="rounded-3xl bg-primary px-6 py-12 text-primary-foreground md:px-14 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <h2 className="text-title">Empieza con tu presupuesto de esta semana</h2>
              <p className="mt-3 max-w-xl text-primary-foreground/85">
                Configura tu hogar en tres pasos. Si todavía no quieres registrar tu despensa, puedes generar tu
                primer menú igual.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Pensado para">
                {AUDIENCES.map((audience) => (
                  <li key={audience} className="rounded-full border border-primary-foreground/25 px-3 py-1 text-sm">
                    {audience}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button size="lg" variant="inverse" asChild>
                <Link to="/registro">
                  Crear mi cuenta <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="highlight" asChild>
                <Link to="/ingresar">Ver la demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
