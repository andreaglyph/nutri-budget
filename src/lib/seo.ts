/** Builds route head meta. Private pages are marked noindex. */
export function pageHead(
  title: string,
  description: string,
  options: { private?: boolean } = {},
) {
  const fullTitle = `${title} · NutriBudget`;
  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (options.private) meta.push({ name: "robots", content: "noindex, nofollow" });
  return { meta };
}
