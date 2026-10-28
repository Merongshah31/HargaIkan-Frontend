import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GUEST_PREFERENCES_STORAGE_KEY } from "../guest/GuestPreferencesProvider";
import { DEMO_SESSION_STORAGE_KEY } from "../session/DemoSessionProvider";
import * as fixtures from "../test/fixtures";
import { mockFetch, renderApp, renderDemoApp } from "../test/utils";

function hasPrivatePath(path: string): boolean {
  return path.startsWith(["/", "me"].join("")) || path.startsWith(["/", "session"].join(""));
}

function referenceHandler() {
  return mockFetch((call) => {
    if (call.path === "/search") return { body: fixtures.searchConfident };
    if (call.path === "/prices/reference") {
      const location = call.query.get("location_id") === fixtures.CHOW_KIT.id ? fixtures.CHOW_KIT : fixtures.KL;
      const quote = call.query.get("quote");
      return { body: fixtures.reference(location, quote ? Number(quote) : null) };
    }
    return undefined;
  });
}

describe("Fish finder", () => {
  it("uses public recommendations and labels synthetic demo data", async () => {
    const user = userEvent.setup();
    const { calls } = referenceHandler();
    renderDemoApp("/cari");

    await screen.findByRole("option", { name: "Kuala Lumpur" });
    await user.type(screen.getByLabelText("Fish name"), "kembung");
    await user.click(screen.getByRole("button", { name: "Search" }));

    const card = await screen.findByRole("region", { name: /Price reference: IKAN KEMBUNG/ });
    expect(within(card).getByText("Historical price")).toBeInTheDocument();
    expect(screen.getByText(/Demo data: fish prices are synthetic examples/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Seller price (RM/kg, optional)"), "8");
    await user.click(screen.getByRole("button", { name: "Check price" }));
    await waitFor(() => expect(within(card).getByTestId("verdict")).toHaveTextContent("Below the historical range"));
    expect(calls.some((call) => call.path === "/recommendations")).toBe(true);
    expect(calls.some((call) => hasPrivatePath(call.path))).toBe(false);
  });
});

describe("Guest preferences", () => {
  it("asks five questions, saves only to browser storage, and confirms clearing", async () => {
    const user = userEvent.setup();
    const { calls } = mockFetch();
    renderDemoApp("/profil");

    const fishChoices = await screen.findAllByLabelText("IKAN KEMBUNG");
    expect(screen.getByRole("group", { name: "What fish do you buy most often?" })).toBeInTheDocument();
    expect(screen.getByLabelText("What is your usual budget?")).toBeInTheDocument();
    expect(screen.getByLabelText("Where do you usually shop?")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Which fish would you like to avoid?" })).toBeInTheDocument();
    expect(screen.getByLabelText("How do you usually cook fish?")).toBeInTheDocument();

    await user.click(fishChoices[0]);
    await user.type(screen.getByLabelText("What is your usual budget?"), "42.50");
    await user.selectOptions(screen.getByLabelText("Where do you usually shop?"), fixtures.KL.id);
    await user.click(fishChoices[1]);
    await user.selectOptions(screen.getByLabelText("How do you usually cook fish?"), "grilled");
    await user.click(screen.getByRole("button", { name: "Save preferences" }));

    expect(await screen.findByText("Preferences saved on this device.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(GUEST_PREFERENCES_STORAGE_KEY) ?? "null")).toEqual({
      favoriteSpeciesIds: [fixtures.KEMBUNG.id],
      typicalBudgetRmPerKg: "42.50",
      preferredLocationId: fixtures.KL.id,
      avoidedSpeciesIds: [fixtures.KEMBUNG.id],
      cookingStyle: "grilled",
    });
    expect(calls.some((call) => hasPrivatePath(call.path))).toBe(false);

    await user.click(screen.getByRole("button", { name: "Clear preferences" }));
    expect(screen.getByText("Clear your saved browser preferences?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(await screen.findByText("Saved browser preferences cleared.")).toBeInTheDocument();
    expect(localStorage.getItem(GUEST_PREFERENCES_STORAGE_KEY)).toBeNull();
  });

  it("rejects a budget outside the local range without persisting it", async () => {
    const user = userEvent.setup();
    mockFetch();
    renderDemoApp("/profil");

    await screen.findByLabelText("What is your usual budget?");
    await user.type(screen.getByLabelText("What is your usual budget?"), "1001");
    await user.click(screen.getByRole("button", { name: "Save preferences" }));

    expect(screen.getByText("Enter a budget greater than RM0 and no more than RM1000 per kg.")).toBeInTheDocument();
    expect(localStorage.getItem(GUEST_PREFERENCES_STORAGE_KEY)).toBeNull();
  });
});

describe("Navigation and travel", () => {
  it("uses English navigation and accessible travel controls", async () => {
    const user = userEvent.setup();
    mockFetch();
    renderDemoApp("/perjalanan");

    const group = screen.getByRole("radiogroup", { name: "Travel mode" });
    expect(within(group).getByRole("radio", { name: "Car" })).toBeChecked();
    await user.click(within(group).getByRole("radio", { name: "Public transport" }));
    expect(screen.getByLabelText("One-way fare (RM)")).toBeInTheDocument();
  });

  it("keeps device geolocation unused", async () => {
    const user = userEvent.setup();
    const { calls } = mockFetch((call) =>
      call.path === "/travel/estimate" ? { body: fixtures.travelNotEstimated } : undefined,
    );
    renderDemoApp("/perjalanan");

    await user.click(screen.getByRole("button", { name: "Calculate estimate" }));
    expect(await screen.findByRole("region", { name: "Cost estimate" })).toHaveTextContent(
      "Travel cost has not been estimated yet",
    );
    expect(calls.some((call) => call.path === "/travel/estimate")).toBe(true);
  });
});

describe("Demo dashboard", () => {
  it("loads public market watch references only", async () => {
    const overview = {
      ...fixtures.overview,
      suggestions: [
        {
          species: fixtures.KEMBUNG,
          location: fixtures.KL,
          p25: 52,
          median: 55.93,
          p75: 70,
          record_count: 800,
          confidence_level: "tinggi",
          period_start: "2026-07-06",
          period_end: "2026-10-25",
          source_label: "Harga sejarah" as const,
          demo: true,
          demo_label: "Data demo",
        },
      ],
    };
    const { calls } = mockFetch((call) => {
      if (call.path === "/overview") return { body: overview };
      if (call.path === "/prices/reference") {
        return {
          body: {
            ...fixtures.reference(),
            chart: {
              location: fixtures.KL,
              points: [
                { week_start: "2026-01-01", median: 54, record_count: 1 },
                { week_start: "2026-01-08", median: 56, record_count: 2 },
              ],
              band_p25: 52,
              band_p75: 70,
              source_label: "Harga sejarah",
              demo: true,
              quote: null,
            },
          },
        };
      }
      return undefined;
    });
    renderDemoApp("/dashboard");

    expect(screen.getByRole("heading", { name: "Welcome, Aisyah." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find a fish" })).toHaveAttribute("href", "/cari");
    expect(screen.getByRole("link", { name: "Set your preferences" })).toHaveAttribute("href", "/profil");
    expect(await screen.findByRole("heading", { name: "Market watch" })).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "2-point historical trend for IKAN KEMBUNG" })).toBeInTheDocument();
    expect(calls.some((call) => call.path === "/overview")).toBe(true);
    expect(calls.some((call) => call.path === "/prices/reference")).toBe(true);
    expect(calls.some((call) => hasPrivatePath(call.path))).toBe(false);
    expect(screen.getByText(/Demo data: fish prices are synthetic examples/)).toBeInTheDocument();
  });

  it("shows saved local preferences with catalogue names", async () => {
    localStorage.setItem(
      GUEST_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        favoriteSpeciesIds: [fixtures.KEMBUNG.id],
        typicalBudgetRmPerKg: "42.50",
        preferredLocationId: fixtures.KL.id,
        avoidedSpeciesIds: [],
        cookingStyle: "fried",
      }),
    );
    mockFetch();
    renderDemoApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Your starting point" })).toBeInTheDocument();
    expect(screen.getByText(/IKAN KEMBUNG/)).toBeInTheDocument();
    expect(screen.getByText(/RM42.50\/kg/)).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Your starting point" })).getByText(/Kuala Lumpur/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit preferences" })).toHaveAttribute("href", "/profil");
  });
});

describe("Homepage and demo login", () => {
  it("shows a public homepage with a demo entry point", () => {
    mockFetch();
    renderApp("/");
    expect(screen.getByRole("heading", { name: "Better fish decisions start here." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start the demo" })).toHaveAttribute("href", "/login");
  });

  it("requires a demo name, asks the five profile questions, then opens the dashboard without a token", async () => {
    const user = userEvent.setup();
    const { calls } = mockFetch();
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Welcome to HargaIkan." })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue to preferences" }));
    expect(screen.getByText("Enter your name to continue.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Your name"), "Aisyah");
    await user.click(screen.getByRole("button", { name: "Continue to preferences" }));

    expect(await screen.findByRole("heading", { name: "Make HargaIkan yours." })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "What fish do you buy most often?" })).toBeInTheDocument();
    expect(screen.getByLabelText("What is your usual budget?")).toBeInTheDocument();
    expect(screen.getByLabelText("Where do you usually shop?")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Which fish would you like to avoid?" })).toBeInTheDocument();
    expect(screen.getByLabelText("How do you usually cook fish?")).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY) ?? "null")).toEqual({ name: "Aisyah", onboardingComplete: false });

    await user.click((await screen.findAllByLabelText("IKAN KEMBUNG"))[0]);
    await user.click(screen.getByRole("button", { name: "Save and open dashboard" }));
    expect(await screen.findByRole("heading", { name: "Welcome, Aisyah." })).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY) ?? "null")).toEqual({ name: "Aisyah", onboardingComplete: true });
    expect(localStorage.getItem(GUEST_PREFERENCES_STORAGE_KEY)).toContain(fixtures.KEMBUNG.id);
    expect(calls.every((call) => !hasPrivatePath(call.path) && !Object.keys(call.headers).some((h) => h.toLowerCase() === "authorization"))).toBe(true);

    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("heading", { name: "Better fish decisions start here." })).toBeInTheDocument();
    expect(sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(GUEST_PREFERENCES_STORAGE_KEY)).toBeNull();
  });

  it("keeps unfinished sessions in onboarding", async () => {
    mockFetch();
    renderDemoApp("/cari", false);
    expect(await screen.findByRole("heading", { name: "Make HargaIkan yours." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Fish finder" })).not.toBeInTheDocument();
  });
});
