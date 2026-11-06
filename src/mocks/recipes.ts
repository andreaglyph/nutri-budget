import arepaConHuevo from "@/assets/recipes/arepa-con-huevo.jpg";
import arrozConHuevo from "@/assets/recipes/arroz-con-huevo.jpg";
import arrozConPollo from "@/assets/recipes/arroz-con-pollo.jpg";
import avenaCasera from "@/assets/recipes/avena-casera.jpg";
import cremaDeAhuyama from "@/assets/recipes/crema-de-ahuyama.jpg";
import ensaladaDeGarbanzos from "@/assets/recipes/ensalada-de-garbanzos.jpg";
import frijoles from "@/assets/recipes/frijoles.jpg";
import lentejasGuisadas from "@/assets/recipes/lentejas-guisadas.jpg";
import pastaConVerduras from "@/assets/recipes/pasta-con-verduras.jpg";
import sopaDeVerduras from "@/assets/recipes/sopa-de-verduras.jpg";
import sudadoDePollo from "@/assets/recipes/sudado-de-pollo.jpg";
import tortillaDeVegetales from "@/assets/recipes/tortilla-de-vegetales.jpg";
import type { MealType, RecipeDetail } from "@/domain/models";

/** Demo recipes. Quantities are in each ingredient's base unit for `servings` portions. */
type Item = [ingredientId: string, quantity: number];

function recipe(
  data: Omit<RecipeDetail, "ingredients" | "active" | "mealTypes"> & { mealTypes: MealType[]; items: Item[] },
): RecipeDetail {
  const { items, ...rest } = data;
  return {
    ...rest,
    active: true,
    ingredients: items.map(([ingredientId, quantity]) => ({ recipeId: data.id, ingredientId, quantity })),
  };
}

export const RECIPES: readonly RecipeDetail[] = [
  recipe({
    id: "rec_arepa_huevo",
    name: "Arepa con huevo",
    description: "Arepa de maíz dorada en sartén, con huevo y queso campesino. Un desayuno rápido y llenador.",
    imageUrl: arepaConHuevo,
    prepMinutes: 20,
    servings: 2,
    mealTypes: ["BREAKFAST"],
    foodGroups: ["Cereales", "Proteínas animales", "Lácteos"],
    steps: [
      "Mezcla la harina de maíz con 200 ml de agua tibia y la sal hasta obtener una masa suave.",
      "Forma dos arepas de 1 cm de grosor.",
      "Ásalas en un sartén con un poco de aceite, 5 minutos por lado.",
      "Fríe los huevos en el mismo sartén.",
      "Unta la mantequilla, pon el huevo encima y termina con queso campesino desmenuzado.",
    ],
    items: [["ing_harina_maiz", 150], ["ing_huevo", 2], ["ing_queso", 60], ["ing_mantequilla", 10], ["ing_aceite", 10], ["ing_sal", 2]],
  }),
  recipe({
    id: "rec_avena",
    name: "Avena casera",
    description: "Bebida caliente de avena con leche, panela y canela, como la de las tiendas de barrio.",
    imageUrl: avenaCasera,
    prepMinutes: 15,
    servings: 2,
    mealTypes: ["BREAKFAST"],
    foodGroups: ["Cereales", "Lácteos", "Azúcares"],
    steps: [
      "Calienta la leche con la canela y la panela a fuego medio.",
      "Agrega la avena y revuelve durante 8 minutos, hasta que espese.",
      "Retira la canela y licúa si la prefieres más suave.",
      "Sirve caliente o deja enfriar en la nevera.",
    ],
    items: [["ing_avena", 80], ["ing_leche", 500], ["ing_panela", 40], ["ing_canela", 3]],
  }),
  recipe({
    id: "rec_arroz_pollo",
    name: "Arroz con pollo",
    description: "Arroz amarillo con pechuga desmechada, arveja, zanahoria y pimentón. Rinde para toda la familia.",
    imageUrl: arrozConPollo,
    prepMinutes: 50,
    servings: 4,
    mealTypes: ["LUNCH", "DINNER"],
    foodGroups: ["Cereales", "Proteínas animales", "Verduras"],
    steps: [
      "Cocina la pechuga en agua con sal durante 20 minutos y desmecha. Guarda el caldo.",
      "Sofríe la cebolla, el ajo y el pimentón en el aceite.",
      "Agrega el arroz, la zanahoria, la arveja y el comino; revuelve 2 minutos.",
      "Añade 800 ml del caldo y el pollo. Cocina tapado a fuego bajo por 20 minutos.",
      "Termina con cilantro picado.",
    ],
    items: [
      ["ing_arroz", 400], ["ing_pechuga", 500], ["ing_zanahoria", 150], ["ing_arveja", 150], ["ing_pimenton", 100],
      ["ing_cebolla", 100], ["ing_ajo", 10], ["ing_aceite", 30], ["ing_sal", 6], ["ing_cilantro", 15], ["ing_comino", 2],
    ],
  }),
  recipe({
    id: "rec_lentejas",
    name: "Lentejas guisadas",
    description: "Lentejas con papa, zanahoria y hogao casero. Económicas y rendidoras.",
    imageUrl: lentejasGuisadas,
    prepMinutes: 45,
    servings: 4,
    mealTypes: ["LUNCH", "DINNER"],
    foodGroups: ["Leguminosas", "Tubérculos", "Verduras"],
    steps: [
      "Lava las lentejas y cocínalas en 1,2 L de agua durante 20 minutos.",
      "Prepara un hogao con tomate, cebolla larga, ajo y aceite.",
      "Agrega la papa y la zanahoria en cubos a las lentejas.",
      "Incorpora el hogao, el comino y la sal. Cocina 15 minutos más.",
    ],
    items: [
      ["ing_lentejas", 300], ["ing_papa", 300], ["ing_zanahoria", 100], ["ing_tomate", 200], ["ing_cebolla_larga", 60],
      ["ing_ajo", 8], ["ing_comino", 2], ["ing_aceite", 20], ["ing_sal", 6],
    ],
  }),
  recipe({
    id: "rec_sudado_pollo",
    name: "Sudado de pollo",
    description: "Presas de pollo cocinadas en salsa de tomate y cebolla con papa y yuca.",
    imageUrl: sudadoDePollo,
    prepMinutes: 50,
    servings: 4,
    mealTypes: ["LUNCH"],
    foodGroups: ["Proteínas animales", "Tubérculos", "Verduras"],
    steps: [
      "Sofríe la cebolla y el ajo en el aceite; agrega el tomate picado y el comino.",
      "Incorpora los muslos de pollo y sella por ambos lados.",
      "Agrega la papa y la yuca en trozos con 400 ml de agua.",
      "Cocina tapado a fuego medio durante 35 minutos.",
      "Rectifica la sal y termina con cilantro.",
    ],
    items: [
      ["ing_muslos", 800], ["ing_papa", 500], ["ing_yuca", 300], ["ing_tomate", 300], ["ing_cebolla", 150],
      ["ing_ajo", 10], ["ing_cilantro", 15], ["ing_aceite", 20], ["ing_sal", 6], ["ing_comino", 2],
    ],
  }),
  recipe({
    id: "rec_ensalada_garbanzos",
    name: "Ensalada de garbanzos",
    description: "Garbanzos con tomate, pepino, aguacate, limón y cilantro. Fresca y sin cocción adicional.",
    imageUrl: ensaladaDeGarbanzos,
    prepMinutes: 20,
    servings: 2,
    mealTypes: ["LUNCH", "DINNER"],
    foodGroups: ["Leguminosas", "Verduras", "Frutas"],
    steps: [
      "Usa garbanzos ya cocidos o cocínalos la noche anterior.",
      "Pica el tomate, el pepino, la cebolla y el aguacate en cubos.",
      "Mezcla todo con el jugo de limón, el aceite, la sal y el cilantro.",
    ],
    items: [
      ["ing_garbanzos", 200], ["ing_tomate", 150], ["ing_pepino", 150], ["ing_cebolla", 50], ["ing_aguacate", 1],
      ["ing_limon", 2], ["ing_cilantro", 10], ["ing_aceite", 15], ["ing_sal", 3],
    ],
  }),
  recipe({
    id: "rec_tortilla_vegetales",
    name: "Tortilla de vegetales",
    description: "Tortilla de huevo con espinaca, tomate, pimentón y queso. Ideal para aprovechar verduras.",
    imageUrl: tortillaDeVegetales,
    prepMinutes: 20,
    servings: 2,
    mealTypes: ["BREAKFAST", "DINNER"],
    foodGroups: ["Proteínas animales", "Verduras", "Lácteos"],
    steps: [
      "Sofríe la cebolla y el pimentón en el aceite durante 3 minutos.",
      "Agrega el tomate y la espinaca hasta que se marchite.",
      "Bate los huevos con la sal y viértelos sobre las verduras.",
      "Cocina tapado a fuego bajo 6 minutos y termina con el queso.",
    ],
    items: [
      ["ing_huevo", 4], ["ing_espinaca", 80], ["ing_tomate", 100], ["ing_cebolla", 50], ["ing_pimenton", 50],
      ["ing_queso", 40], ["ing_aceite", 10], ["ing_sal", 2],
    ],
  }),
  recipe({
    id: "rec_pasta_verduras",
    name: "Pasta con verduras",
    description: "Espagueti con salsa de tomate, zanahoria, habichuela y pimentón salteados.",
    imageUrl: pastaConVerduras,
    prepMinutes: 30,
    servings: 2,
    mealTypes: ["LUNCH", "DINNER"],
    foodGroups: ["Cereales", "Verduras", "Lácteos"],
    steps: [
      "Cocina la pasta en agua con sal según el empaque.",
      "Saltea el ajo, la zanahoria, la habichuela y el pimentón en el aceite.",
      "Agrega el tomate picado y cocina 8 minutos.",
      "Mezcla con la pasta y sirve con queso rallado.",
    ],
    items: [
      ["ing_pasta", 250], ["ing_zanahoria", 100], ["ing_habichuela", 100], ["ing_pimenton", 80], ["ing_tomate", 200],
      ["ing_ajo", 6], ["ing_queso", 40], ["ing_aceite", 15], ["ing_sal", 3],
    ],
  }),
  recipe({
    id: "rec_frijoles",
    name: "Fríjoles",
    description: "Fríjoles rojos con plátano verde, zanahoria y tocineta, acompañados de arroz.",
    imageUrl: frijoles,
    prepMinutes: 120,
    servings: 4,
    mealTypes: ["LUNCH"],
    foodGroups: ["Leguminosas", "Cereales", "Proteínas animales", "Tubérculos"],
    steps: [
      "Remoja los fríjoles desde la noche anterior.",
      "Cocínalos en olla a presión con 1,5 L de agua durante 40 minutos.",
      "Agrega el plátano verde y la zanahoria en trozos; cocina 20 minutos más.",
      "Fríe la tocineta y prepara un hogao con tomate y cebolla larga; incorpóralos.",
      "Sirve con el arroz cocido.",
    ],
    items: [
      ["ing_frijol", 400], ["ing_platano_verde", 1], ["ing_zanahoria", 100], ["ing_tocineta", 100], ["ing_tomate", 150],
      ["ing_cebolla_larga", 60], ["ing_comino", 2], ["ing_sal", 6], ["ing_aceite", 15], ["ing_arroz", 300],
    ],
  }),
  recipe({
    id: "rec_sopa_verduras",
    name: "Sopa de verduras",
    description: "Sopa casera con papa, ahuyama, habichuela, repollo y arveja.",
    imageUrl: sopaDeVerduras,
    prepMinutes: 40,
    servings: 4,
    mealTypes: ["LUNCH", "DINNER"],
    foodGroups: ["Verduras", "Tubérculos", "Leguminosas"],
    steps: [
      "Hierve 1,5 L de agua con la cebolla larga y el ajo.",
      "Agrega la papa, la zanahoria y la ahuyama en cubos; cocina 15 minutos.",
      "Incorpora la habichuela, la arveja y el repollo; cocina 10 minutos más.",
      "Ajusta la sal y termina con cilantro.",
    ],
    items: [
      ["ing_papa", 300], ["ing_zanahoria", 150], ["ing_ahuyama", 200], ["ing_habichuela", 100], ["ing_repollo", 150],
      ["ing_arveja", 100], ["ing_cebolla_larga", 50], ["ing_ajo", 6], ["ing_cilantro", 15], ["ing_sal", 6],
    ],
  }),
  recipe({
    id: "rec_arroz_huevo",
    name: "Arroz con huevo",
    description: "Arroz blanco con huevo frito y tajadas de maduro. Sencillo, rápido y económico.",
    imageUrl: arrozConHuevo,
    prepMinutes: 20,
    servings: 2,
    mealTypes: ["LUNCH", "DINNER"],
    foodGroups: ["Cereales", "Proteínas animales", "Tubérculos"],
    steps: [
      "Sofríe la cebolla larga en un poco de aceite, agrega el arroz y 400 ml de agua con sal.",
      "Cocina tapado a fuego bajo durante 18 minutos.",
      "Fríe las tajadas de plátano maduro hasta dorar.",
      "Fríe los huevos y sirve sobre el arroz.",
    ],
    items: [["ing_arroz", 200], ["ing_huevo", 3], ["ing_platano_maduro", 1], ["ing_cebolla_larga", 30], ["ing_aceite", 20], ["ing_sal", 3]],
  }),
  recipe({
    id: "rec_crema_ahuyama",
    name: "Crema de ahuyama",
    description: "Crema suave de ahuyama con papa, leche y un toque de crema.",
    imageUrl: cremaDeAhuyama,
    prepMinutes: 35,
    servings: 4,
    mealTypes: ["LUNCH", "DINNER"],
    foodGroups: ["Verduras", "Tubérculos", "Lácteos"],
    steps: [
      "Sofríe la cebolla y el ajo en la mantequilla.",
      "Agrega la ahuyama y la papa en cubos con 600 ml de agua; cocina 20 minutos.",
      "Licúa con la leche hasta obtener una crema lisa.",
      "Calienta de nuevo, ajusta la sal y sirve con la crema de leche.",
    ],
    items: [
      ["ing_ahuyama", 800], ["ing_papa", 200], ["ing_cebolla", 100], ["ing_ajo", 6], ["ing_leche", 300],
      ["ing_crema", 100], ["ing_mantequilla", 20], ["ing_sal", 5],
    ],
  }),
];
