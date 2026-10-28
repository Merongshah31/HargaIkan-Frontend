import { describe, expect, it } from "vitest";

const frontendSources = import.meta.glob("../**/*.{ts,tsx}", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

describe("guest-only frontend boundary", () => {
  it("contains no account SDK, sign-in, build-variable, or private-route source references", () => {
    const prohibited = [
      ["@", "supabase"].join(""),
      ["signIn", "Anonymously"].join(""),
      ["VI", "TE_"].join(""),
      ["/", "session", "/demo"].join(""),
      ["/", "me", "/"].join(""),
    ];

    for (const [file, content] of Object.entries(frontendSources)) {
      for (const phrase of prohibited) {
        expect(content, `${file} must not contain ${phrase}`).not.toContain(phrase);
      }
    }
  });
});
