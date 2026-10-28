import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type CookingStyle = "" | "fried" | "steamed" | "curry" | "grilled" | "other";

export interface GuestPreferences {
  favoriteSpeciesIds: string[];
  typicalBudgetRmPerKg: string;
  preferredLocationId: string;
  avoidedSpeciesIds: string[];
  cookingStyle: CookingStyle;
}

export interface GuestPreferencesValue {
  preferences: GuestPreferences;
  isComplete: boolean;
  save: (next: GuestPreferences) => void;
  clear: () => void;
}

export const GUEST_PREFERENCES_STORAGE_KEY = "hargaikan.guestPreferences.v1";

const EMPTY_PREFERENCES: GuestPreferences = {
  favoriteSpeciesIds: [],
  typicalBudgetRmPerKg: "",
  preferredLocationId: "",
  avoidedSpeciesIds: [],
  cookingStyle: "",
};

const cookingStyles = new Set<CookingStyle>(["", "fried", "steamed", "curry", "grilled", "other"]);
const GuestPreferencesContext = createContext<GuestPreferencesValue | null>(null);

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0))];
}

export function normalizeGuestPreferences(value: unknown): GuestPreferences {
  const candidate = value && typeof value === "object" ? (value as Partial<GuestPreferences>) : {};
  const cookingStyle = cookingStyles.has(candidate.cookingStyle as CookingStyle)
    ? (candidate.cookingStyle as CookingStyle)
    : "";

  return {
    favoriteSpeciesIds: uniqueStrings(candidate.favoriteSpeciesIds),
    typicalBudgetRmPerKg:
      typeof candidate.typicalBudgetRmPerKg === "string" ? candidate.typicalBudgetRmPerKg.trim() : "",
    preferredLocationId: typeof candidate.preferredLocationId === "string" ? candidate.preferredLocationId : "",
    avoidedSpeciesIds: uniqueStrings(candidate.avoidedSpeciesIds),
    cookingStyle,
  };
}

/** Safely read browser-only preferences; unavailable or malformed storage is treated as empty. */
export function readGuestPreferences(storage: StorageLike | null = browserStorage()): GuestPreferences {
  if (!storage) return { ...EMPTY_PREFERENCES };
  try {
    const raw = storage.getItem(GUEST_PREFERENCES_STORAGE_KEY);
    return raw ? normalizeGuestPreferences(JSON.parse(raw)) : { ...EMPTY_PREFERENCES };
  } catch {
    return { ...EMPTY_PREFERENCES };
  }
}

/** Returns false instead of failing when browser storage is unavailable or full. */
export function writeGuestPreferences(
  next: GuestPreferences,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(GUEST_PREFERENCES_STORAGE_KEY, JSON.stringify(normalizeGuestPreferences(next)));
    return true;
  } catch {
    return false;
  }
}

export function clearGuestPreferences(storage: StorageLike | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(GUEST_PREFERENCES_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function preferencesAreComplete(preferences: GuestPreferences): boolean {
  return Boolean(
    preferences.favoriteSpeciesIds.length ||
      preferences.typicalBudgetRmPerKg.trim() ||
      preferences.preferredLocationId,
  );
}

export function GuestPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<GuestPreferences>(() => readGuestPreferences());

  const save = useCallback((next: GuestPreferences) => {
    const normalized = normalizeGuestPreferences(next);
    setPreferences(normalized);
    writeGuestPreferences(normalized);
  }, []);

  const clear = useCallback(() => {
    setPreferences({ ...EMPTY_PREFERENCES });
    clearGuestPreferences();
  }, []);

  const value = useMemo<GuestPreferencesValue>(
    () => ({ preferences, isComplete: preferencesAreComplete(preferences), save, clear }),
    [preferences, save, clear],
  );

  return <GuestPreferencesContext.Provider value={value}>{children}</GuestPreferencesContext.Provider>;
}

export function useGuestPreferences(): GuestPreferencesValue {
  const context = useContext(GuestPreferencesContext);
  if (!context) throw new Error("useGuestPreferences must be used inside GuestPreferencesProvider");
  return context;
}
