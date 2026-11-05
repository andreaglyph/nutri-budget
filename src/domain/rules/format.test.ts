import { describe, expect, it } from "vitest";

import { formatCOP, initials } from "./format";

describe("formatCOP", () => {
  it("formats a weekly budget as '$ 150.000 COP'", () => {
    expect(formatCOP(150000)).toBe("$ 150.000 COP");
  });

  it("groups millions with dots", () => {
    expect(formatCOP(1250000)).toBe("$ 1.250.000 COP");
  });

  it("rounds to whole pesos", () => {
    expect(formatCOP(4899.6)).toBe("$ 4.900 COP");
  });

  it("keeps the sign for negative balances", () => {
    expect(formatCOP(-12500)).toBe("-$ 12.500 COP");
  });
});

describe("initials", () => {
  it("uses the first two names", () => {
    expect(initials("Laura Martínez Gómez")).toBe("LM");
  });
});
