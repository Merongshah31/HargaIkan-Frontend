// Public API origin configured per environment. An empty value uses the local proxy/rewrite.
export const API_PREFIX = "/api/v1";

export function normalizeApiBaseUrl(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/+$/, "").replace(/\/api\/v1$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
