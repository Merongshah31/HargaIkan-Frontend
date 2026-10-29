import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Labels, SourceBadge } from "./Labels";
import { isHighPrice, MarketWatchList, trendFor } from "./MarketWatchList";
import { OfflineNotice } from "./OfflineNotice";
import { SmartAlerts } from "./SmartAlerts";
import { priceLevel, SmartSwaps, type SwapSuggestion } from "./SmartSwaps";
import { ForecastCard } from "./ForecastCard";
import { ReferenceCard } from "./ReferenceCard";
import { formatTooltipValue } from "./PriceChart";
import { Recommendations } from "./Recommendations";
import { Verdict } from "./Verdict";
import { translateApiText } from "../i18n";
import { alerts, alertsWeatherUnavailable, KL, KEMBUNG, recsEmpty, recsWithItem, reference } from "../test/fixtures";
describe("source labels", () => { it("renders English source labels with icons", () => { render(<SourceBadge label="Harga sejarah" />); expect(screen.getByTestId("source-label")).toHaveTextContent("📊 Historical price"); }); it("never displays demo or synthetic disclosure", () => { render(<Labels source="Anggaran model" />); expect(screen.getByText("Model estimate")).toBeInTheDocument(); expect(screen.queryByText(/data demo|synthetic/i)).not.toBeInTheDocument(); }); });
describe("API text translation", () => { it("maps known static backend text", () => expect(translateApiText("Data belum tersedia")).toBe("Data is not available yet")); it("keeps unknown dynamic text unchanged", () => expect(translateApiText("Unrecognised message: Jakarta")).toBe("Unrecognised message: Jakarta")); });
describe("MarketWatchList", () => {
  const suggestion = { species: { id: "sp-kembung", name_ms: "IKAN KEMBUNG" }, location: { id: "kl", name: "Kuala Lumpur", level: "negeri" }, p25: 10, median: 12.5, p75: 15, record_count: 4, confidence_level: "tinggi", period_start: "2026-01-01", period_end: "2026-01-07", source_label: "Harga sejarah" as const, demo: false, demo_label: null };
  const point = (week_start: string, median: number) => ({ week_start, median, record_count: 2 });

  it("replaces the sparkline with an up triangle, the change and the words", () => {
    const { container } = render(<MarketWatchList items={[{ suggestion, points: [point("2026-01-01", 12), point("2026-01-08", 13)] }]} />);
    expect(container.querySelector(".market-arrow")).toHaveTextContent("▲");
    expect(screen.getByText("8.3%")).toBeInTheDocument();
    expect(screen.getByText("rising vs last week")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText(/data demo|synthetic/i)).not.toBeInTheDocument();
  });

  it("points down when the latest week is cheaper than the week before", () => {
    const { container } = render(<MarketWatchList items={[{ suggestion, points: [point("2026-01-01", 13), point("2026-01-08", 12)] }]} />);
    expect(container.querySelector(".market-arrow")).toHaveTextContent("▼");
    expect(screen.getByText("7.7%")).toBeInTheDocument();
    expect(screen.getByText("falling vs last week")).toBeInTheDocument();
  });

  it("warns only when the latest week is above the published P75 band", () => {
    const high = render(<MarketWatchList items={[{ suggestion, points: [point("2026-01-01", 12), point("2026-01-08", 16)] }]} />);
    expect(screen.getByText("Price is above the P75 of its recent range")).toBeInTheDocument();
    high.unmount();

    render(<MarketWatchList items={[{ suggestion, points: [point("2026-01-01", 12), point("2026-01-08", 14)] }]} />);
    expect(screen.queryByText("Price is above the P75 of its recent range")).not.toBeInTheDocument();
  });

  it("uses a reference label and no arrow for zero or one point", () => {
    const { container } = render(<MarketWatchList items={[{ suggestion, points: [] }, { suggestion: { ...suggestion, species: { id: "one", name_ms: "IKAN SELAR" } }, points: [point("2026-01-01", 12)] }]} />);
    expect(screen.getAllByText("Historical reference")).toHaveLength(2);
    expect(container.querySelector(".market-arrow")).toBeNull();
    expect(container.querySelector(".market-trend-value")).toBeNull();
  });

  it("hides synthetic reference prices", () => {
    render(<MarketWatchList items={[{ suggestion: { ...suggestion, demo: true }, points: [] }]} />);
    expect(screen.queryByText("RM12.50/kg")).not.toBeInTheDocument();
  });

  it("derives movement only from two published points", () => {
    expect(trendFor([])).toBeNull();
    expect(trendFor([point("2026-01-01", 12)])).toBeNull();
    expect(trendFor([point("2026-01-01", 12), point("2026-01-08", 12)])).toEqual({ direction: "flat", percent: 0 });
    expect(trendFor([point("2026-01-01", 0), point("2026-01-08", 12)])).toBeNull();
    expect(isHighPrice(16, 15)).toBe(true);
    expect(isHighPrice(15, 15)).toBe(false);
    expect(isHighPrice(null, 15)).toBe(false);
  });
});
describe("SmartAlerts", () => {
  it("shows every alert with its kind, its translated wording and its source", () => {
    render(<SmartAlerts data={alerts} />);
    expect(screen.getByRole("heading", { name: "Weather & festivity alerts" })).toBeInTheDocument();
    expect(screen.getAllByText("⚠️")).toHaveLength(2);

    // Weather: Open-Meteo, translated, with the day the alert covers.
    expect(screen.getByText("Weather")).toBeInTheDocument();
    expect(screen.getByText(/Heavy rain expected/)).toBeInTheDocument();
    expect(screen.getByText(/Open-Meteo forecasts 15\.4 mm of rain\. HargaIkan flags a day at 10 mm or more\./)).toBeInTheDocument();
    expect(screen.getByText(/Kuala Lumpur weather forecast, not an official MET Malaysia warning/)).toBeInTheDocument();
    expect(screen.getByText(/· until 29 Oct 2026/)).toBeInTheDocument();

    // Festivity: the calendar entry, dated "on" the day rather than "until".
    expect(screen.getByText("Festivity")).toBeInTheDocument();
    expect(screen.getByText(/This festival is 10 days away\. It comes from HargaIkan's public-holiday calendar, not a price forecast\./)).toBeInTheDocument();
    expect(screen.getByText(/Malaysian public-holiday calendar \(kabinet\.gov\.my\)/)).toBeInTheDocument();
    expect(screen.getByText(/· on 8 Nov 2026/)).toBeInTheDocument();

    // An alert is a forecast, never a price or a saving.
    expect(screen.queryByText(/RM\d/)).not.toBeInTheDocument();
  });

  it("shows a readable notice when a source cannot be read, and keeps the other one", () => {
    render(<SmartAlerts data={alertsWeatherUnavailable} />);
    expect(screen.getByText(/Weather data \(Open-Meteo\) could not be read right now/)).toBeInTheDocument();
    expect(screen.getByText(/This festival is 10 days away/)).toBeInTheDocument();
    expect(screen.queryByText(/Heavy rain expected/)).not.toBeInTheDocument();
  });

  it("falls back to the empty state when there is nothing to report", () => {
    render(<SmartAlerts data={{ items: [], notice: null, demo: false }} />);
    expect(screen.getByText("No weather or festivity alerts apply to your saved markets right now.")).toBeInTheDocument();
  });

});

describe("SmartSwaps", () => {
  const row: SwapSuggestion = {
    favourite: KEMBUNG,
    favouritePrice: 70.43,
    level: "high",
    locationName: KL.name,
    swap: recsWithItem.items[0],
  };

  it("names the expensive favourite, its level, and the cheaper verified swap", () => {
    render(<MemoryRouter><SmartSwaps items={[row]} hasPreferences /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Smart swaps for you" })).toBeInTheDocument();
    expect(screen.getByText("IKAN KEMBUNG")).toBeInTheDocument();
    expect(screen.getByText("RM70.43/kg")).toBeInTheDocument();
    expect(screen.getByText("(High)")).toBeInTheDocument();
    expect(screen.getByText("IKAN SELAR")).toBeInTheDocument();
    expect(screen.getByText("RM22.00/kg")).toBeInTheDocument();
    expect(screen.getByText("Saving")).toBeInTheDocument();
    expect(screen.getByTestId("source-label")).toHaveTextContent("Historical price");
    expect(screen.getByRole("link", { name: "Compare in the fish finder" })).toHaveAttribute("href", "/cari");
  });

  it("explains an empty list rather than showing a swap that is not cheaper", () => {
    render(<MemoryRouter><SmartSwaps items={[]} hasPreferences /></MemoryRouter>);
    expect(screen.getByText(/None of your favourite fish is priced high right now/)).toBeInTheDocument();
  });

  it("asks for a favourite when nothing is saved", () => {
    render(<MemoryRouter><SmartSwaps items={[]} hasPreferences={false} /></MemoryRouter>);
    expect(screen.getByText(/Save a favourite fish in your preferences/)).toBeInTheDocument();
  });

  it("takes the price level from the published band, never from a guess", () => {
    expect(priceLevel(70.43, { p25: 52, p75: 70.43 })).toBe("high");
    expect(priceLevel(52, { p25: 52, p75: 70 })).toBe("low");
    expect(priceLevel(60, { p25: 52, p75: 70 })).toBe("typical");
  });
});

describe("chart tooltip formatter", () => { it("formats real values without inventing one", () => { expect(formatTooltipValue(55.93)).toBe("RM55.93/kg"); expect(formatTooltipValue("abc")).toBe("—"); }); });
describe("translated cards", () => { it("translates verdict text", () => { render(<Verdict verdict={{ kind: "below", text: "Di bawah julat sejarah", icon: "⬇️" }} />); expect(screen.getByTestId("verdict")).toHaveTextContent("Below the historical range"); }); it("keeps the allergy disclaimer for empty recommendations", () => { render(<Recommendations data={recsEmpty} />); expect(screen.getByText("No recommendations")).toBeInTheDocument(); expect(screen.getByTestId("disclaimer")).toHaveTextContent("not medical advice"); }); it("uses English labels for recommendation fields", () => { render(<Recommendations data={recsWithItem} />); expect(screen.getByText("Historical price")).toBeInTheDocument(); expect(screen.getByText("Over budget")).toBeInTheDocument(); }); it("does not show a synthetic saving as a real recommendation", () => { render(<Recommendations data={{ ...recsWithItem, items: [{ ...recsWithItem.items[0], demo: true }] }} />); expect(screen.queryByText("RM33.93/kg")).not.toBeInTheDocument(); }); });

describe("synthetic price safeguards", () => {
  it("hides all reference values, including verdict and seller quote, when the band is synthetic", () => {
    const data = reference(KL, 80);
    render(<ReferenceCard data={{ ...data, band: { ...data.band!, demo: true } }} />);
    expect(screen.getByText(/Published fish price records are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText(/RM55\.93|RM80/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("verdict")).not.toBeInTheDocument();
  });

  it("hides a model estimate derived from synthetic data", () => {
    render(<ForecastCard data={{
      species: KEMBUNG,
      location: KL,
      available: true,
      message: null,
      prediction: {
        predicted_median: 50,
        p10: 45,
        p90: 55,
        method: "test",
        model_version: "test",
        mae: 2,
        target_start: "2026-10-01",
        target_end: "2026-10-08",
        last_data_date: "2026-09-30",
        is_baseline: false,
        location: KL,
        source_label: "Anggaran model",
        demo: true,
      },
      quote: null,
      quote_error: null,
      p75_message: null,
      early_buy_message: null,
    }} />);
    expect(screen.getByText(/Published fish price records are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText("RM50.00/kg")).not.toBeInTheDocument();
  });
});

describe("OfflineNotice", () => {
  const goOffline = (offline: boolean) =>
    Object.defineProperty(navigator, "onLine", { configurable: true, value: !offline });

  it("stays out of the way while the browser is online", () => {
    goOffline(false);
    render(<OfflineNotice />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("explains the empty sections when the connection drops, and clears when it returns", () => {
    goOffline(true);
    try {
      render(<OfflineNotice />);
      expect(screen.getByRole("status")).toHaveTextContent(/You are offline/);
      expect(screen.getByRole("status")).toHaveTextContent(/need a connection/);

      goOffline(false);
      act(() => { window.dispatchEvent(new Event("online")); });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    } finally {
      goOffline(false);
    }
  });
});
