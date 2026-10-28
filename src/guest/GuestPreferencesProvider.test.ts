import { describe, expect, it } from "vitest";
import {
  GUEST_PREFERENCES_STORAGE_KEY,
  clearGuestPreferences,
  readGuestPreferences,
  writeGuestPreferences,
} from "./GuestPreferencesProvider";

const preferences = {
  favoriteSpeciesIds: ["sp-kembung"],
  typicalBudgetRmPerKg: "32.50",
  preferredLocationId: "loc-kl",
  avoidedSpeciesIds: ["sp-selar"],
  cookingStyle: "fried" as const,
};

describe("guest preference storage", () => {
  it("writes and reads versioned local browser preferences", () => {
    expect(writeGuestPreferences(preferences, localStorage)).toBe(true);
    expect(localStorage.getItem(GUEST_PREFERENCES_STORAGE_KEY)).toBe(JSON.stringify(preferences));
    expect(readGuestPreferences(localStorage)).toEqual(preferences);
  });

  it("gracefully treats unavailable storage as empty and can clear saved values", () => {
    expect(readGuestPreferences(null)).toEqual({
      favoriteSpeciesIds: [],
      typicalBudgetRmPerKg: "",
      preferredLocationId: "",
      avoidedSpeciesIds: [],
      cookingStyle: "",
    });
    writeGuestPreferences(preferences, localStorage);
    expect(clearGuestPreferences(localStorage)).toBe(true);
    expect(localStorage.getItem(GUEST_PREFERENCES_STORAGE_KEY)).toBeNull();
  });
});
