import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface DemoSession {
  name: string;
  onboardingComplete: boolean;
}

interface DemoSessionValue {
  session: DemoSession | null;
  login: (name: string) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const DEMO_SESSION_STORAGE_KEY = "hargaikan.demoSession.v1";

function readSession(): DemoSession | null {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const candidate = value as Partial<DemoSession>;
    const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
    return name ? { name, onboardingComplete: candidate.onboardingComplete === true } : null;
  } catch {
    return null;
  }
}

function writeSession(session: DemoSession | null): void {
  try {
    if (session) sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  } catch {
    // The demo still works for this page when browser storage is unavailable.
  }
}

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(readSession);

  const login = useCallback((name: string) => {
    const next = { name: name.trim(), onboardingComplete: false };
    if (!next.name) return;
    setSession(next);
    writeSession(next);
  }, []);

  const completeOnboarding = useCallback(() => {
    setSession((current) => {
      if (!current) return null;
      const next = { ...current, onboardingComplete: true };
      writeSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    writeSession(null);
  }, []);

  const value = useMemo(() => ({ session, login, completeOnboarding, logout }), [session, login, completeOnboarding, logout]);
  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionValue {
  const context = useContext(DemoSessionContext);
  if (!context) throw new Error("useDemoSession must be used inside DemoSessionProvider");
  return context;
}
