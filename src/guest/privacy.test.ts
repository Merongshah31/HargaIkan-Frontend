import { describe, expect, it } from "vitest";

const frontendSources = import.meta.glob("../**/*.{ts,tsx}", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

describe("token-free demo boundary", () => {
  it("contains no account SDK or private backend route references", () => {
    const prohibited = [
      ["@", "supabase"].join(""),
      ["signIn", "Anonymously"].join(""),
      ["/", "session", "/demo"].join(""),
      ["/", "me", "/"].join(""),
      ["Bearer", " "].join(""),
    ];

    for (const [file, content] of Object.entries(frontendSources)) {
      for (const phrase of prohibited) {
        expect(content, `${file} must not contain ${phrase}`).not.toContain(phrase);
      }
    }
  });
});
