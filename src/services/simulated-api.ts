/**
 * Helpers that make mock services behave like a REST API: async responses,
 * latency and typed errors. Swap these services for real HTTP clients later.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function simulateLatency(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const isBrowser = () => typeof window !== "undefined";
