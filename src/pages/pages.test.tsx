import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GUEST_PREFERENCES_STORAGE_KEY } from "../guest/GuestPreferencesProvider";
import { FORECAST } from "../messages";
import { changePercent, changeText, forecastTiles, heatLevel, normalizeFishName } from "./Ramalan";
import * as fixtures from "../test/fixtures";
import { mockFetch, renderApp } from "../test/utils";

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

const snapshotFixture = {
  model: "Random Forest", model_sha256: "a", feature_sha256: "b", mae: 0.636,
  baseline_mae: 0.308, testing_records: 39,
  items: [
    { item_code: "1476", fish_name: "IKAN KEMBUNG (ANTARA 8 HINGGA 12 EKOR SEKILOGRAM)", target_date: "2026-10-28", value: 19.68 },
    { item_code: "1436", fish_name: "IKAN KERISI (ANTARA 5 HINGGA 10 EKOR SEKILOGRAM)", target_date: "2026-10-28", value: 18.87 },
  ],
};

/** Reference medians per fish, so the heat map has something to compare each estimate with. */
function heatMapHandler() {
  return mockFetch((call) => {
    if (call.path === "/forecast/snapshot") return { body: snapshotFixture };
    if (call.path === "/prices/reference") {
      const median = call.query.get("species_id") === fixtures.KEMBUNG.id ? 18.4 : 20;
      return { body: { ...fixtures.reference(), band: { ...fixtures.reference().band, median } } };
    }
    return undefined;
  });
}

it("shows every fish as a heat-map tile with the change against the published median", async () => {
  heatMapHandler();
  const { container } = renderApp("/ramalan");

  await waitFor(() => expect(container.querySelectorAll(".heat-cell")).toHaveLength(1));
  const tiles = [...container.querySelectorAll(".heat-cell")];
  const tile = (name: string) => tiles.find((cell) => cell.textContent?.includes(name))!;

  // 19.68 against a published median of 18.40 is +7.0%: a mid-step rise. The model names its fish
  // with size notation, so this also covers the name matching. The median arrives after the tiles.
  await waitFor(() => expect(tile("IKAN KEMBUNG")).toHaveTextContent("+7.0%"));
  expect(tile("IKAN KEMBUNG")).toHaveTextContent("RM19.68/kg");
  expect(tile("IKAN KEMBUNG")).toHaveClass("up2");

  // The catalogue is the list of fish we publish, so a model row alone does not add a tile.
  expect(tile("IKAN KERISI")).toBeUndefined();
  expect(screen.getByText(/Above the median/)).toBeInTheDocument();
  // The caveat banners are gone; the provenance line and the source labels still carry it.
  expect(screen.queryByText(/Treat these values as experimental/)).not.toBeInTheDocument();
  expect(screen.queryByText(/They are not market quotes/)).not.toBeInTheDocument();
  expect(screen.getByText(/does not identify a location or unit/)).toBeInTheDocument();
  expect(screen.queryByLabelText("Fish")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Location")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "View forecast" })).not.toBeInTheDocument();
});

it("keeps the exact numbers and their source in the table under the heat map", async () => {
  heatMapHandler();
  const user = userEvent.setup();
  renderApp("/ramalan");
  await user.click(await screen.findByText("View these numbers as a table"));

  const table = screen.getByRole("table", { name: "Model forecast and published median for every fish" });
  const row = within(table).getByRole("row", { name: /IKAN KEMBUNG/ });
  expect(row).toHaveTextContent("RM19.68/kg");
  expect(row).toHaveTextContent("RM18.40/kg");
  expect(row).toHaveTextContent("28 Oct 2026");
  expect(row).toHaveTextContent("Model estimate");
});

it("keeps a fish the model does not cover, without inventing a value", async () => {
  mockFetch((call) => (call.path === "/forecast/snapshot" ? {
    body: { ...snapshotFixture, items: [snapshotFixture.items[1]] },
  } : undefined));
  const { container } = renderApp("/ramalan");

  await waitFor(() => expect(container.querySelectorAll(".heat-cell")).toHaveLength(1));
  expect(container.querySelector(".heat-cell")).toHaveTextContent("No estimate");
  expect(container.querySelector(".heat-cell")).toHaveClass("none");
});

describe("forecast heat map", () => {
  it("normalises the model's size notation and measures the change against the median", () => {
    expect(normalizeFishName("IKAN SELAR KUNING ( 11 EKOR SEKILOGRAM)")).toBe("IKAN SELAR KUNING");
    expect(changePercent(19.68, 18.4)?.toFixed(1)).toBe("7.0");
    expect(changePercent(18.87, null)).toBeNull();
    expect(changePercent(10, 0)).toBeNull();
  });

  it("steps the colour by the size of the move", () => {
    expect(heatLevel(0)).toBe("flat");
    expect(heatLevel(1.4)).toBe("up1");
    expect(heatLevel(7.4)).toBe("up2");
    expect(heatLevel(-23.7)).toBe("down3");
    expect(heatLevel(null)).toBe("none");
    expect(changeText(-23.66)).toBe("−23.7%");
    expect(changeText(null)).toBe(FORECAST.noReference);
  });

  it("makes one tile per catalogue fish and sizes it by the median price", () => {
    const tiles = forecastTiles(fixtures.species.items, snapshotFixture, { [fixtures.KEMBUNG.id]: 18.4 });
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toMatchObject({
      key: fixtures.KEMBUNG.id,
      name: "IKAN KEMBUNG",
      estimate: 19.68,
      median: 18.4,
      level: "up2",
      weight: 18.4,
      targetDate: "2026-10-28",
    });
  });
});

describe("Fish finder", () => {
  it("uses public recommendations and published price records", async () => {
    const user = userEvent.setup();
    const { calls } = referenceHandler();
    renderApp("/cari");

    await screen.findByRole("option", { name: "Kuala Lumpur" });
    await user.type(screen.getByLabelText("Fish name"), "kembung");
    await user.click(screen.getByRole("button", { name: "Search" }));

    const card = await screen.findByRole("region", { name: /Price reference: IKAN KEMBUNG/ });
    expect(within(card).getByText("Historical price")).toBeInTheDocument();
    expect(screen.queryByText(/demo data/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Seller price (RM/kg, optional)"), "8");
    await user.click(screen.getByRole("button", { name: "Check price" }));
    await waitFor(() => expect(within(card).getByTestId("verdict")).toHaveTextContent("Below the historical range"));
    expect(calls.some((call) => call.path === "/recommendations")).toBe(true);
    expect(calls.some((call) => hasPrivatePath(call.path))).toBe(false);
  });

  it("does not present synthetic prices or verdicts as published prices", async () => {
    const user = userEvent.setup();
    mockFetch((call) => {
      if (call.path === "/search") return { body: fixtures.searchConfident };
      if (call.path === "/prices/reference") return { body: { ...fixtures.reference(), demo: true, band: { ...fixtures.reference().band!, demo: true } } };
      return undefined;
    });
    renderApp("/cari");
    await screen.findByRole("option", { name: "Kuala Lumpur" });
    await user.type(screen.getByLabelText("Fish name"), "kembung");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText(/Published fish price records are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText("RM55.93/kg")).not.toBeInTheDocument();
  });

  it("does not offer the generated fish catalog when the backend is in memory mode", async () => {
    const { calls } = mockFetch((call) => call.path === "/species"
      ? { body: { ...fixtures.species, demo: true } }
      : undefined);
    renderApp("/cari");
    expect(await screen.findByText(/Published fish price records are not available yet/)).toBeInTheDocument();
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
    expect(screen.queryByText("IKAN KEMBUNG")).not.toBeInTheDocument();
    expect(calls.some((call) => call.path === "/search" || call.path === "/prices/reference")).toBe(false);
  });
});

describe("Guest preferences", () => {
  it("asks five questions, saves only to browser storage, and confirms clearing", async () => {
    const user = userEvent.setup();
    const { calls } = mockFetch();
    renderApp("/profil");

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
    renderApp("/profil");

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
    renderApp("/perjalanan");

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
    renderApp("/perjalanan");

    await user.click(screen.getByRole("button", { name: "Calculate estimate" }));
    expect(await screen.findByRole("region", { name: "Cost estimate" })).toHaveTextContent(
      "Travel cost has not been estimated yet",
    );
    expect(calls.some((call) => call.path === "/travel/estimate")).toBe(true);
  });

  it("does not prefill a synthetic price or overwrite a price the visitor entered", async () => {
    const user = userEvent.setup();
    const { calls } = mockFetch((call) => call.path === "/prices/reference"
      ? { body: { ...fixtures.reference(), demo: true, band: { ...fixtures.reference().band!, demo: true } } }
      : undefined);
    renderApp("/perjalanan");
    await screen.findByRole("option", { name: "Kuala Lumpur" });
    await user.type(screen.getByLabelText(/Fish price \(RM\/kg\)/), "30.00");
    await user.click(screen.getByText("Fill fish price from the historical median"));
    await user.selectOptions(screen.getByLabelText("Fish"), fixtures.KEMBUNG.id);
    await user.click(screen.getByRole("button", { name: "Use historical median" }));

    expect(await screen.findByText(/Published fish price records are not available yet/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fish price \(RM\/kg\)/)).toHaveValue("30.00");
    expect(calls.some((call) => call.path === "/prices/reference")).toBe(true);
  });

  it("prefills a published price with its source label", async () => {
    const user = userEvent.setup();
    mockFetch((call) => call.path === "/prices/reference" ? { body: fixtures.reference() } : undefined);
    renderApp("/perjalanan");
    await screen.findByRole("option", { name: "Kuala Lumpur" });
    await user.click(screen.getByText("Fill fish price from the historical median"));
    await user.selectOptions(screen.getByLabelText("Fish"), fixtures.KEMBUNG.id);
    await user.click(screen.getByRole("button", { name: "Use historical median" }));

    await waitFor(() => expect(screen.getByLabelText(/Fish price \(RM\/kg\)/)).toHaveValue("55.93"));
    expect(screen.getByText(/Filled from median Kuala Lumpur/)).toBeInTheDocument();
  });
});

describe("Dashboard", () => {
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
          demo: false,
          demo_label: null,
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
              demo: false,
              quote: null,
            },
          },
        };
      }
      return undefined;
    });
    renderApp("/dashboard");

    expect(screen.getByRole("heading", { name: "Know your fish price." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find a fish" })).toHaveAttribute("href", "/cari");
    expect(screen.getByRole("link", { name: "Set your preferences" })).toHaveAttribute("href", "/profil");
    expect(await screen.findByRole("heading", { name: "Market watch" })).toBeInTheDocument();
    // 54 → 56 compares the last two published weeks; the old sparkline is gone.
    expect(await screen.findByText("3.7%")).toBeInTheDocument();
    expect(screen.getByText("rising vs last week")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(calls.some((call) => call.path === "/overview")).toBe(true);
    expect(calls.some((call) => call.path === "/prices/reference")).toBe(true);
    expect(calls.some((call) => hasPrivatePath(call.path))).toBe(false);
    expect(screen.queryByText(/demo data/i)).not.toBeInTheDocument();
  });

  it("does not show synthetic market watch figures", async () => {
    mockFetch((call) => call.path === "/overview" ? { body: { ...fixtures.overview, demo: true } } : undefined);
    renderApp("/dashboard");
    expect(await screen.findByText(/Published fish price records are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText("Fish species")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Market watch" })).not.toBeInTheDocument();
  });

  it("shows the weather forecast and festival alerts the API returns", async () => {
    mockFetch((call) => (call.path === "/alerts" ? { body: fixtures.alerts } : undefined));
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Weather & festivity alerts" })).toBeInTheDocument();
    expect(screen.getByText(/Heavy rain expected/)).toBeInTheDocument();
    expect(screen.getByText(/This festival is 10 days away/)).toBeInTheDocument();
    expect(screen.getByText(/· on 8 Nov 2026/)).toBeInTheDocument();
  });

  it("says when an alert source could not be read instead of inventing one", async () => {
    mockFetch((call) => (call.path === "/alerts" ? { body: fixtures.alertsWeatherUnavailable } : undefined));
    renderApp("/dashboard");

    expect(await screen.findByText(/Weather data \(Open-Meteo\) could not be read right now/)).toBeInTheDocument();
    expect(screen.queryByText(/Heavy rain expected/)).not.toBeInTheDocument();
  });

  it("suggests a cheaper verified similar fish when a favourite is priced high", async () => {
    localStorage.setItem(
      GUEST_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        favoriteSpeciesIds: [fixtures.KEMBUNG.id],
        typicalBudgetRmPerKg: "",
        preferredLocationId: fixtures.KL.id,
        avoidedSpeciesIds: [],
        cookingStyle: "",
      }),
    );
    mockFetch((call) => {
      if (call.path === "/prices/reference") {
        return {
          body: {
            ...fixtures.reference(),
            band: { ...fixtures.reference().band!, p25: 52.05, median: 70.43, p75: 70.43 },
          },
        };
      }
      if (call.path === "/recommendations") return { body: fixtures.recsWithItem };
      return undefined;
    });
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Smart swaps for you" })).toBeInTheDocument();
    expect(await screen.findByText("(High)")).toBeInTheDocument();
    expect(screen.getByText("RM70.43/kg")).toBeInTheDocument();
    expect(screen.getByText("IKAN SELAR")).toBeInTheDocument();
    expect(screen.getByText("RM22.00/kg")).toBeInTheDocument();
  });

  it("does not suggest a swap when the favourite is inside its band", async () => {
    localStorage.setItem(
      GUEST_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        favoriteSpeciesIds: [fixtures.KEMBUNG.id],
        typicalBudgetRmPerKg: "",
        preferredLocationId: fixtures.KL.id,
        avoidedSpeciesIds: [],
        cookingStyle: "",
      }),
    );
    mockFetch((call) => {
      if (call.path === "/prices/reference") return { body: fixtures.reference() };
      if (call.path === "/recommendations") return { body: fixtures.recsWithItem };
      return undefined;
    });
    renderApp("/dashboard");

    expect(await screen.findByText(/None of your favourite fish is priced high right now/)).toBeInTheDocument();
    expect(screen.queryByText("IKAN SELAR")).not.toBeInTheDocument();
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
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Your starting point" })).toBeInTheDocument();
    expect(screen.getByText(/IKAN KEMBUNG/)).toBeInTheDocument();
    expect(screen.getByText(/RM42.50\/kg/)).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Your starting point" })).getByText(/Kuala Lumpur/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit preferences" })).toHaveAttribute("href", "/profil");
  });
});

describe("Public homepage", () => {
  it("shows the homepage, the public tools and the way in to the sign-in step", () => {
    mockFetch();
    renderApp("/", { session: null });
    expect(screen.getByRole("heading", { name: "Know the price. Buy with confidence." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore fish prices/ })).toHaveAttribute("href", "/cari");
    expect(screen.getByRole("link", { name: /Plan your trip/ })).toHaveAttribute("href", "/perjalanan");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText(/Demo data: fish prices are synthetic examples/)).not.toBeInTheDocument();
  });

  it("mounts the Three.js fish stage and keeps the static illustration as its fallback", () => {
    mockFetch();
    renderApp("/");
    const stage = screen.getByTestId("home-fish-stage");
    expect(stage).toBeInTheDocument();
    // jsdom exposes no WebGL context, so the decorative SVG must remain visible.
    expect(stage.querySelector("svg.home-fish-static")).not.toBeNull();
    expect(stage.querySelector("canvas")).toBeNull();
    expect(stage.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("opens the fish finder without a session or private request", async () => {
    const user = userEvent.setup();
    const { calls } = mockFetch();
    renderApp("/", { session: null });
    await user.click(screen.getByRole("link", { name: /Explore fish prices/ }));
    expect(await screen.findByRole("heading", { name: "Fish finder" })).toBeInTheDocument();
    expect(calls.every((call) => !hasPrivatePath(call.path) && !Object.keys(call.headers).some((h) => h.toLowerCase() === "authorization"))).toBe(true);
  });
});

describe("Sign-in, preferences and dashboard", () => {
  it("sends a signed-out visitor who asks for the dashboard from the homepage to the sign-in step", async () => {
    const user = userEvent.setup();
    mockFetch();
    renderApp("/", { session: null });
    await user.click(screen.getByRole("link", { name: /Explore market watch/ }));
    expect(await screen.findByRole("heading", { name: "Sign in to HargaIkan" })).toBeInTheDocument();
  });

  it("takes a signed-out visitor from the dashboard through sign-in and preferences to the dashboard", async () => {
    const user = userEvent.setup();
    mockFetch();
    renderApp("/dashboard", { session: null });

    expect(await screen.findByRole("heading", { name: "Sign in to HargaIkan" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Know your fish price." })).not.toBeInTheDocument();
    expect(screen.queryByText("Aisyah")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("What should we call you?"), "Aisyah");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("heading", { name: "Your fish preferences" })).toBeInTheDocument();
    expect(screen.getByText("Two minutes of preferences, then your dashboard opens.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save and continue to dashboard" }));
    expect(await screen.findByRole("heading", { name: "Know your fish price." })).toBeInTheDocument();
    expect(screen.getByText("Aisyah")).toBeInTheDocument();
  });

  it("keeps a signed-in visitor on the preferences step until it is saved", async () => {
    mockFetch();
    renderApp("/dashboard", { session: { name: "Aisyah", onboardingComplete: false } });
    expect(await screen.findByRole("heading", { name: "Your fish preferences" })).toBeInTheDocument();
  });

  it("requires a name before continuing, without leaving the sign-in step", async () => {
    const user = userEvent.setup();
    mockFetch();
    renderApp("/login", { session: null });
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name to continue.");
    expect(screen.getByRole("heading", { name: "Sign in to HargaIkan" })).toBeInTheDocument();
  });

  it("offers sign-out to a visitor who is already signed in", async () => {
    const user = userEvent.setup();
    mockFetch();
    renderApp("/login");
    expect(screen.getByText(/You are already signed in/)).toBeInTheDocument();
    // Shown twice on purpose: the header keeps the visitor's name and sign-out at hand.
    expect(screen.getAllByText("Test visitor")).toHaveLength(2);
    await user.click(screen.getAllByRole("button", { name: "Sign out" })[0]);
    expect(screen.queryByText(/You are already signed in/)).not.toBeInTheDocument();
    expect(screen.queryAllByText("Test visitor")).toHaveLength(0);
    expect(screen.getAllByRole("link", { name: "Log in" })[0]).toHaveAttribute("href", "/login");
    expect(screen.getByLabelText("What should we call you?")).toBeInTheDocument();
  });

  it("redirects the obsolete onboarding URL to the preferences step", async () => {
    mockFetch();
    renderApp("/onboarding", { session: null });
    expect(await screen.findByRole("heading", { name: "Your fish preferences" })).toBeInTheDocument();
  });
});

describe("Dual language (EN / BM)", () => {
  it("switches the interface between English and Bahasa Melayu and persists the choice", async () => {
    const user = userEvent.setup();
    mockFetch();
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Know your fish price." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "BM" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "BM" }));

    expect(screen.getByRole("button", { name: "BM" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Ketahui harga ikan anda." })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Cari ikan" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: "Ramalan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Perjalanan" })).toBeInTheDocument();
    expect(window.localStorage.getItem("hargaikan.language.v1")).toBe("ms");

    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Know your fish price." })).toBeInTheDocument();
    expect(window.localStorage.getItem("hargaikan.language.v1")).toBe("en");
  });
});
