// Device-only sign-in state for the review flow: there is NO token, NO account and NO request to
// the server. The name is kept in sessionStorage under a versioned key, so it disappears when the
// tab closes, and nothing about it is ever sent to FastAPI.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface Session {
  name: string;
  /** False until the visitor has been through the preferences step. */
  onboardingComplete: boolean;
}

export interface SessionValue {
  session: Session | null;
  signIn: (name: string) => void;
  completeOnboarding: () => void;
  signOut: () => void;
}

export const SESSION_STORAGE_KEY = "hargaikan.session.v1";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Safely read the device-only session; unavailable or malformed storage counts as signed out. */
export function readSession(storage: StorageLike | null = browserStorage()): Session | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const candidate = value as Partial<Session>;
    const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
    return name ? { name, onboardingComplete: candidate.onboardingComplete === true } : null;
  } catch {
    return null;
  }
}

/** Returns false instead of failing when browser storage is unavailable. */
export function writeSession(session: Session | null, storage: StorageLike | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    if (session) storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    else storage.removeItem(SESSION_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const signIn = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next: Session = { name: trimmed, onboardingComplete: false };
    setSession(next);
    writeSession(next);
  }, []);

  const completeOnboarding = useCallback(() => {
    setSession((current) => {
      if (!current) return null;
      const next: Session = { ...current, onboardingComplete: true };
      writeSession(next);
      return next;
    });
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    writeSession(null);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ session, signIn, completeOnboarding, signOut }),
    [session, signIn, completeOnboarding, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
