import type { Session, UserRole } from "@/domain/models";
import { DEMO_ACCOUNTS } from "@/mocks/users";

import { ApiError, isBrowser, simulateLatency } from "./simulated-api";

/**
 * Simulated authentication (prototype only). Mirrors the future
 * POST /api/auth/login and POST /api/auth/logout endpoints.
 * Session lives in localStorage; flash messages in sessionStorage.
 */
const SESSION_KEY = "nb.session";
const FLASH_KEY = "nb.flash";

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function readSession(): Session | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  try {
    cachedSession = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

function writeSession(session: Session | null) {
  if (!isBrowser()) return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
  emit();
}

export const authService = {
  getSession: readSession,

  subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY) listener();
    };
    if (isBrowser()) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (isBrowser()) window.removeEventListener("storage", onStorage);
    };
  },

  async login(email: string, password: string): Promise<Session> {
    await simulateLatency();
    const account = DEMO_ACCOUNTS.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account || account.password !== password) {
      throw new ApiError("INVALID_CREDENTIALS", "El correo o la contraseña no son correctos.");
    }
    const session: Session = {
      userId: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      onboardingCompleted: account.onboardingCompleted,
      startedAt: new Date().toISOString(),
    };
    writeSession(session);
    return session;
  },

  async loginAsDemo(role: UserRole): Promise<Session> {
    const account = DEMO_ACCOUNTS.find((candidate) => candidate.role === role);
    if (!account) throw new ApiError("NOT_FOUND", "No hay una cuenta demo para este rol.");
    return authService.login(account.email, account.password);
  },

  logout() {
    writeSession(null);
  },

  /** One-shot message shown after a redirect (e.g. access denied). */
  setFlash(message: string) {
    if (isBrowser()) window.sessionStorage.setItem(FLASH_KEY, message);
  },

  consumeFlash(): string | null {
    if (!isBrowser()) return null;
    const message = window.sessionStorage.getItem(FLASH_KEY);
    if (message) window.sessionStorage.removeItem(FLASH_KEY);
    return message;
  },
};
