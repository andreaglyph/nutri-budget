import type { ID, Session, UserRole } from "@/domain/models";
import { DEMO_ACCOUNTS } from "@/mocks/users";

import { newId, readDb, updateDb } from "./db";
import { ApiError, isBrowser, simulateLatency } from "./simulated-api";

/**
 * Simulated authentication (prototype only). Mirrors the future
 * POST /api/auth/register, /login and /logout endpoints.
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

function sessionFor(userId: ID, startedAt = new Date().toISOString()): Session | null {
  const db = readDb();
  const user = db.users.find((candidate) => candidate.id === userId);
  if (!user) return null;
  const profile = db.profiles.find((candidate) => candidate.userId === userId);
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    startedAt,
  };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  acceptDataProcessing: boolean;
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
    const credential = readDb().credentials.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
    );
    const session = credential && credential.password === password ? sessionFor(credential.userId) : null;
    if (!session) throw new ApiError("INVALID_CREDENTIALS", "El correo o la contraseña no son correctos.");
    writeSession(session);
    return session;
  },

  async loginAsDemo(role: UserRole): Promise<Session> {
    const account = DEMO_ACCOUNTS.find((candidate) => candidate.role === role);
    if (!account) throw new ApiError("NOT_FOUND", "No hay una cuenta demo para este rol.");
    return authService.login(account.email, account.password);
  },

  /** Creates a USER account and signs it in; onboarding is still pending. */
  async register(input: RegisterInput): Promise<Session> {
    await simulateLatency(600);
    if (!input.acceptTerms || !input.acceptDataProcessing) {
      throw new ApiError("CONSENT_REQUIRED", "Debes aceptar los términos y el tratamiento de datos para crear tu cuenta.");
    }
    const email = input.email.trim().toLowerCase();
    if (readDb().credentials.some((credential) => credential.email.toLowerCase() === email)) {
      throw new ApiError("EMAIL_TAKEN", "Ya existe una cuenta con este correo. Ingresa con él o usa otro.");
    }
    const userId = newId("usr");
    const now = new Date().toISOString();
    updateDb((db) => {
      db.users.push({ id: userId, name: input.name.trim(), email, role: "USER", termsAcceptedAt: now, dataProcessingAcceptedAt: now, createdAt: now });
      db.credentials.push({ userId, email, password: input.password });
      db.profiles.push({ userId, householdSize: 1, plannedMealTypes: [], onboardingCompleted: false });
      db.dietary.push({ userId, preferenceTagIds: [], restrictionTagIds: [], allergyTagIds: [], excludedIngredientIds: [] });
    });
    const session = sessionFor(userId, now);
    if (!session) throw new ApiError("UNKNOWN", "No pudimos crear tu cuenta. Intenta de nuevo.");
    writeSession(session);
    return session;
  },

  /** Re-reads name and onboarding state after the profile changes. */
  refreshSession() {
    const current = readSession();
    if (!current) return;
    writeSession(sessionFor(current.userId, current.startedAt));
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
