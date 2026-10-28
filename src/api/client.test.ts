import { describe, expect, it, vi } from "vitest";
import { ApiError, buildUrl, errorMessages, parseErrorBody, request } from "./client";
import { NETWORK_ERROR, SECTION_UNAVAILABLE } from "../messages";
import { normalizeApiBaseUrl } from "../config";

async function rejectsWithApiError(promise: Promise<unknown>): Promise<ApiError> {
  const error: unknown = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  if (!(error instanceof ApiError)) throw new Error(`expected ApiError, got ${String(error)}`);
  return error;
}

describe("parseErrorBody", () => {
  it("reads the backend detail shape", () => {
    const error = parseErrorBody(400, {
      detail: {
        code: "invalid_input",
        messages: ["Bajet mesti nombor antara RM0.01 dan RM1000/kg."],
        fields: { budget: "Bajet mesti nombor antara RM0.01 dan RM1000/kg." },
      },
    });

    expect(error.status).toBe(400);
    expect(error.code).toBe("invalid_input");
    expect(error.messages).toHaveLength(1);
    expect(error.fields.budget).toMatch(/Bajet/);
  });

  it("accepts a plain string detail and safely falls back for unknown bodies", () => {
    expect(parseErrorBody(404, { detail: "Not Found" }).messages).toEqual(["Not Found"]);
    expect(parseErrorBody(500, "<html>oops</html>").messages).toEqual([SECTION_UNAVAILABLE]);
  });
});

describe("public requests", () => {
  it("uses a relative API URL and never sends credentials", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await request("/health", { method: "POST", body: { check: true } });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(url).toBe("/api/v1/health");
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"check":true}');
    expect(headers).toEqual({ Accept: "application/json", "Content-Type": "application/json" });
    expect(headers).not.toHaveProperty(["Author", "ization"].join(""));
  });

  it("maps network failures to the public network message", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    const error = await rejectsWithApiError(request("/health"));

    expect(error.code).toBe("network_error");
    expect(errorMessages(error)).toEqual([NETWORK_ERROR]);
  });
});

describe("buildUrl", () => {
  it("omits empty query values when the environment is unset", () => {
    expect(buildUrl("/health")).toBe("/api/v1/health");
    expect(buildUrl("/prices/reference", { species_id: "a", location_id: "b", grade: null, quote: "" })).toBe(
      "/api/v1/prices/reference?species_id=a&location_id=b",
    );
  });

  it("normalizes a configured backend origin", () => {
    expect(normalizeApiBaseUrl(" https://api.example.com/ ")).toBe("https://api.example.com");
    expect(normalizeApiBaseUrl("https://api.example.com/api/v1/")).toBe("https://api.example.com");
  });

  it("builds requests against the configured backend origin", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/");
    vi.resetModules();
    const { buildUrl: configuredBuildUrl, request: configuredRequest } = await import("./client");
    expect(configuredBuildUrl("/health")).toBe("https://api.example.com/api/v1/health");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ status: "ok" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await configuredRequest("/health");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.com/api/v1/health");
    expect(init.headers).not.toHaveProperty("Authorization");
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
