import { describe, expect, it } from "vitest";
import { SESSION_STORAGE_KEY, readSession, writeSession } from "./SessionProvider";

const session = { name: "Aisyah", onboardingComplete: false };

describe("device-only session storage", () => {
  it("writes and reads a versioned tab session, trimming the name", () => {
    expect(writeSession({ name: "  Aisyah  ", onboardingComplete: true }, sessionStorage)).toBe(true);
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      JSON.stringify({ name: "  Aisyah  ", onboardingComplete: true }),
    );
    expect(readSession(sessionStorage)).toEqual({ name: "Aisyah", onboardingComplete: true });
  });

  it("treats unavailable or malformed storage as signed out", () => {
    expect(readSession(null)).toBeNull();
    expect(writeSession(session, null)).toBe(false);
    sessionStorage.setItem(SESSION_STORAGE_KEY, "not json");
    expect(readSession(sessionStorage)).toBeNull();
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ onboardingComplete: true }));
    expect(readSession(sessionStorage)).toBeNull();
  });

  it("signs out by removing the stored session", () => {
    writeSession(session, sessionStorage);
    expect(readSession(sessionStorage)).toEqual(session);
    expect(writeSession(null, sessionStorage)).toBe(true);
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
