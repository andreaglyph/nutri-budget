# NutriBudget — Etapa 1: Plan del prototipo

> Nota: solo recibí el prompt maestro. El **SRS v1.0** y el **análisis de auditoría** no venían adjuntos. Este plan se basa en lo que el prompt resume de ambos; si los subes, ajusto el plan antes de empezar.

## 1. Módulos

| # | Módulo | Requisitos | Tipo |
|---|---|---|---|
| 0 | Sitio público | — | Definido |
| 1 | Autenticación y cuenta | RF-01, RF-02, RF-20 | Definido |
| 2 | Onboarding y perfil alimentario | RF-03, RF-05 | Definido |
| 3 | Dashboard | RF-21 | Propuesta auditoría |
| 4 | Presupuesto | RF-04 | Definido |
| 5 | Inventario (lotes) | RF-06, RF-07 | Definido + corrección auditoría |
| 6 | Recetario | RF-08 | Definido |
| 7 | Planificador / generador | RF-09 a RF-12 | Definido + reglas auditoría |
| 8 | Lista de compras | RF-13 | Definido |
| 9 | Compras y gastos | RF-14 a RF-16 | Definido |
| 10 | Historial | — | Definido |
| 11 | Administración | Roles USER/ADMIN | Definido |

## 2. Arquitectura de navegación

```text
Público            /  ·  /registro  ·  /ingresar  ·  /terminos  ·  /privacidad
Onboarding         /onboarding   (pasos 1-3 con indicador de progreso)
App (USER)         /app                      Dashboard
                   /app/presupuesto
                   /app/inventario
                   /app/recetas  ·  /app/recetas/:id
                   /app/planificador         (configurar + calendario)
                   /app/planificador/:mealId (detalle de comida)
                   /app/lista-compras
                   /app/gastos  ·  /app/gastos/nueva
                   /app/historial  ·  /app/historial/:planId
                   /app/perfil               (preferencias, eliminar cuenta)
Admin (ADMIN)      /admin  ·  /admin/recetas  ·  /admin/recetas/:id
                   /admin/ingredientes  ·  /admin/precios
```

- Protección conceptual: sesión simulada. Sin sesión → `/ingresar`. Perfil incompleto → `/onboarding`. USER que entra a `/admin` → redirección con aviso.
- En `/ingresar` habrá accesos rápidos "Entrar como usuario demo" y "Entrar como administrador demo".
- Escritorio: barra lateral + cabecera con avatar y accesos rápidos. Móvil (desde 360 px): barra inferior con 5 accesos principales + menú "Más".

## 3. Pantallas y estados clave

| Pantalla | Contenido principal | Estados |
|---|---|---|
| Inicio público | Hero, cómo funciona (4 pasos), beneficios, funcionalidades, ahorro y desperdicio, llamado a registrarse, footer | — |
| Registro / Ingreso | Validación inmediata, términos + tratamiento de datos (`terms_accepted_at`), "¿Olvidaste tu contraseña?" deshabilitado como "Próximamente" | Error, cargando |
| Onboarding | Paso 1 hogar y 4 categorías separadas; paso 2 presupuesto y fechas; paso 3 inventario omitible | Validación, confirmación |
| Dashboard | Presupuesto, próxima comida, menú del día, inventario por vencer, compras pendientes, mensajes guía | Vacío sin configuración |
| Presupuesto | Crear/editar, estimado vs. real, saldo, % usado | Error por solapamiento o valor ≤ 0 |
| Inventario | Lotes por ingrediente, búsqueda, filtro por categoría, orden por fecha, pestañas Disponibles / Por consumir / Agotado | Vacío, confirmar eliminación |
| Recetario + detalle | Tarjetas con foto, filtros (comida, tiempo, ingrediente, categoría, preferencia, costo), detalle con ingredientes, pasos y costo | Sin resultados |
| Planificador | Configuración → generación → calendario semana × comida, desglose de 5 costos, cambiar receta, regenerar, faltantes/disponibles | Cargando, plan supera presupuesto, sin recetas compatibles |
| Lista de compras | Agrupada por ingrediente, necesario / en casa / falta, subtotal, casillas, filtros, estado | Vacía sin menú |
| Gastos / nueva compra | Registro con valor real por línea (`line_total`), vinculación opcional a la lista, compra parcial, gráfica estimado vs. real | Vacío, confirmación |
| Historial | Menús, presupuestos, compras, evolución, costos congelados | Vacío |
| Perfil | Datos, preferencias, alergias, exclusiones, eliminar cuenta (doble confirmación) | Confirmación |
| Admin | Tablas CRUD de recetas, ingredientes (unidad base, categoría, grupo, conflictos) y precios (fuente, fecha, alerta de desactualizado) | Vacío, validación |

## 4. Componentes reutilizables

- **Base:** Botón (primario, secundario, fantasma, peligro), campo, selector, casilla, chips de selección, modal, aviso emergente, alerta, etiqueta de estado, tarjeta, pestañas, indicador de pasos, barra de progreso, estado vacío, esqueleto de carga, tabla.
- **Formato:** `Money` ($ 150.000 COP), `Quantity` (conversión g↔kg, ml↔L), `DateLabel`, `ProvisionalNote` (marca visible de comportamientos pendientes de aprobación), `EstimatedPriceNote`.
- **Estructura:** cabecera y footer públicos, barra lateral de la app, cabecera de la app, navegación móvil, barra lateral de admin.
- **Dominio:** tarjeta de presupuesto, tarjeta de receta, filtros de receta, fila de lote, etiqueta de vencimiento, calendario semanal, casilla de comida, modal de cambio de receta, desglose de costos, fila de lista de compras, formulario de compra, gráfica estimado vs. real.

## 5. Datos simulados

- Catálogo: ~45 ingredientes colombianos con unidad base, categoría, grupo alimentario y precio de ejemplo con fuente "Estimación de demostración" y fecha.
- 12 recetas del prompt (arepa con huevo, avena, arroz con pollo, lentejas, sudado, ensalada de garbanzos, tortilla de vegetales, pasta con verduras, fríjoles, sopa de verduras, arroz con huevo, crema de ahuyama) con foto generada, porciones, pasos, etiquetas y conflictos.
- Etiquetas: vegetariano, sin gluten, sin lactosa, alergia al huevo, al maní, a mariscos, etc.
- Usuario demo "Laura" (hogar de 2, $ 150.000 COP semanales, 10 lotes de inventario, algunos por vencer), un menú activo, una lista generada, 2 compras registradas, 3 semanas de historial. Un admin demo.
- Todas las cifras se derivan de las mismas funciones de cálculo, para que coincidan entre módulos.

## 6. Generador de menús (reglas, sin IA)

1. Filtrar recetas incompatibles con alergias, restricciones y exclusiones (a través de los conflictos entre ingredientes y etiquetas).
2. Puntuar: uso de ingredientes por vencer, costo de compra faltante, variedad (sin repetir receta en el mismo día ni más de 2 veces por semana) y balance de grupos.
3. Llenar las casillas día × comida de forma voraz respetando el presupuesto; el resultado es determinístico (regenerar = otra semilla).
4. Consolidar la necesidad total por ingrediente en su unidad base → descontar inventario **una sola vez**, primero los lotes que vencen antes → lista de compras con solo lo que falta.
5. Escalar por número de personas versus las porciones de la receta.

## 7. Puntos que requieren tu confirmación

| Decisión pendiente | Comportamiento provisional en el prototipo |
|---|---|
| Viabilidad del presupuesto | Medida con `estimated_purchase_cost`, señalada con `ProvisionalNote` |
| Descontar inventario al marcar COOKED | Acción opcional con confirmación y nota "provisional" |
| Sumar a inventario al registrar compra | Casilla "Agregar sobrante al inventario", marcada como provisional |
| Sustituciones | Solo cambio de receta; sustitución de ingredientes no se construye |
| Recuperación de contraseña | Enlace visible deshabilitado "Próximamente" |
| Comidas a planificar | Desayuno, almuerzo y cena, configurables por el usuario |
| Cantidad de recetas | 12 en la demo (la auditoría propone 40–60) |
| Idioma | Interfaz en español, identificadores en inglés |
| Despliegue y equipo | Fuera del alcance del prototipo |

## 8. Construcción por etapas

1. **Etapa 2 — Sistema visual y estructura:** colores y tipografías oficiales, componentes base, estructura pública/app/admin, navegación responsive, sesión demo y protección de rutas, sitio público completo.
2. **Etapa 3 — Flujos principales:** registro, ingreso, onboarding, dashboard, presupuesto, inventario, recetario + detalle (con fotos generadas).
3. **Etapa 4 — Funcionalidad central:** generador, calendario semanal, detalle de comida, cambio de receta, lista de compras.
4. **Etapa 5 — Seguimiento:** registro de compras, control de gastos, historial.
5. **Etapa 6 — Administración:** recetas, ingredientes, precios.
6. **Etapa 7 — Validación:** pruebas automáticas de reglas, revisión visual en 360/768/1280 px, teclado y contraste, consola sin errores.

Al terminar cada etapa me detengo para que la revises.

## Detalles técnicos

- Stack de Lovable: TanStack Start (React 19 + TypeScript + Tailwind v4). Esto **no** es Angular; la arquitectura final (Angular + Spring Boot + PostgreSQL) se respeta.
- Estructura portable:
  - `src/domain/models/` — tipos que reflejan las 23 entidades (User, UserProfile, DietaryTag, UserDietaryRestriction, UserExcludedIngredient, IngredientDietConflict, Ingredient, Unit, IngredientPrice, UserInventory, Recipe, RecipeMealType, RecipeIngredient, Budget, MealPlan, MealPlanItem, ShoppingList, ShoppingListItem, Purchase, PurchaseItem…). `IngredientSubstitution` y `MealPlanItemSubstitution` solo como tipos.
  - `src/domain/rules/` — funciones puras (unidades, generador, consolidación, costos, validaciones), trasladables a servicios Java.
  - `src/services/` — repositorios simulados asíncronos con firmas parecidas a endpoints REST, latencia y errores simulables, persistencia en el navegador (localStorage) y botón "Restablecer datos demo".
  - `src/mocks/` — datos semilla. `src/components/{ui,layout,<módulo>}`. `src/routes/`.
- Estado: TanStack Query sobre los servicios; sesión simulada con rol.
- Sin Lovable Cloud ni otro backend hasta que lo autorices.
- Pruebas unitarias (Vitest) para: no duplicar descuento de inventario, orden por vencimiento, exclusión por alergias, conversión de unidades, cálculos de presupuesto y solapamiento de presupuestos.
