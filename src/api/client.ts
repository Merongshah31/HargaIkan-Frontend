// Typed fetch wrapper for the public HargaIkan FastAPI routes.
// Errors are parsed from {"detail": {"code", "messages": [backend text], "fields"?}}.

import { API_BASE_URL, API_PREFIX } from "../config";
import { NETWORK_ERROR, SECTION_UNAVAILABLE } from "../messages";
import type {
  AlertsOut,
  ForecastOut,
  HealthOut,
  LocationListOut,
  ModelSnapshotOut,
  OverviewOut,
  RecommendationsOut,
  ReferenceOut,
  SearchOut,
  SpeciesListOut,
  TravelIn,
  TravelOut,
} from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly messages: string[];
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, messages: string[], fields?: Record<string, string> | null) {
    super(messages.join(" "));
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.messages = messages.length ? messages : [SECTION_UNAVAILABLE];
    this.fields = fields ?? {};
  }
}

/** Turn any response body into an ApiError without throwing while parsing it. */
export function parseErrorBody(status: number, body: unknown): ApiError {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (detail && typeof detail === "object") {
      const value = detail as { code?: unknown; messages?: unknown; fields?: unknown };
      const messages = Array.isArray(value.messages)
        ? value.messages.filter((item): item is string => typeof item === "string")
        : [];
      const fields =
        value.fields && typeof value.fields === "object"
          ? (value.fields as Record<string, string>)
          : undefined;
      return new ApiError(status, typeof value.code === "string" ? value.code : "http_error", messages, fields);
    }
    if (typeof detail === "string" && detail) return new ApiError(status, "http_error", [detail]);
  }
  return new ApiError(status, "http_error", [SECTION_UNAVAILABLE]);
}

/** Messages for display from any thrown value. */
export function errorMessages(error: unknown): string[] {
  return error instanceof ApiError ? error.messages : [SECTION_UNAVAILABLE];
}

type Query = Record<string, string | number | null | undefined>;

export interface RequestOptions {
  method?: "GET" | "POST";
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
}

/** Build a relative public API URL, such as /api/v1/health. */
export function buildUrl(path: string, query?: Query): string {
  const url = `${API_BASE_URL}${API_PREFIX}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }

  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "network_error", [NETWORK_ERROR]);
  }

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) throw parseErrorBody(response.status, body);
  if (body === null) throw new ApiError(response.status, "invalid_response", [SECTION_UNAVAILABLE]);
  return body as T;
}

/** The frontend intentionally exposes only public backend calls. */
export const api = {
  health: (signal?: AbortSignal) => request<HealthOut>("/health", { signal }),
  species: () => request<SpeciesListOut>("/species"),
  locations: () => request<LocationListOut>("/locations"),
  search: (query: string) => request<SearchOut>("/search", { query: { q: query } }),
  reference: (params: { species_id: string; location_id: string; grade?: string | null; quote?: string | null }) =>
    request<ReferenceOut>("/prices/reference", { query: params }),
  recommendations: (params: { species_id: string; location_id: string }) =>
    request<RecommendationsOut>("/recommendations", { query: params }),
  forecast: (params: { species_id: string; location_id: string; quote?: string | null }) =>
    request<ForecastOut>("/forecast", { query: params }),
  forecastSnapshot: () => request<ModelSnapshotOut>("/forecast/snapshot"),
  travel: (body: TravelIn) => request<TravelOut>("/travel/estimate", { method: "POST", body }),
  overview: () => request<OverviewOut>("/overview"),
  alerts: () => request<AlertsOut>("/alerts"),
};
