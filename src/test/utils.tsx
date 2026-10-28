import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { App } from "../App";
import * as fixtures from "./fixtures";

export interface MockCall {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: Record<string, string>;
  body: unknown;
}

type Handler = (call: MockCall) => { status?: number; body: unknown } | undefined;

/** Stub public fetch calls. The test URL base makes relative request URLs valid in jsdom. */
export function mockFetch(handler: Handler = () => undefined) {
  const calls: MockCall[] = [];
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), "http://test.local");
    const call: MockCall = {
      method: init?.method ?? "GET",
      path: url.pathname.replace(/^\/api\/v1/, ""),
      query: url.searchParams,
      headers: (init?.headers as Record<string, string>) ?? {},
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    calls.push(call);

    const response = handler(call) ?? defaults(call);
    return new Response(JSON.stringify(response.body), {
      status: response.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  vi.stubGlobal("fetch", fn);
  return { fn, calls };
}

function defaults(call: MockCall): { status?: number; body: unknown } {
  switch (call.path) {
    case "/species":
      return { body: fixtures.species };
    case "/locations":
      return { body: fixtures.locations };
    case "/recommendations":
      return { body: fixtures.recsEmpty };
    case "/overview":
      return { body: fixtures.overview };
    default:
      return {
        status: 404,
        body: { detail: { code: "not_found", messages: ["Maklumat yang diminta tidak ditemui."] } },
      };
  }
}

export function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
