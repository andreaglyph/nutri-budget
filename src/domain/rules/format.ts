/** Group digits with dots, Colombian style: 150000 -> "150.000". */
function groupThousands(value: number): string {
  const rounded = Math.round(Math.abs(value)).toString();
  return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Format a COP amount as "$ 150.000 COP". Negative values keep a leading minus. */
export function formatCOP(value: number, options: { suffix?: boolean } = {}): string {
  const { suffix = true } = options;
  const sign = value < 0 ? "-" : "";
  return `${sign}$ ${groupThousands(value)}${suffix ? " COP" : ""}`;
}

/** Initials for avatars: "Laura Martínez" -> "LM". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
