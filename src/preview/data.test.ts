// Guards the temporary design-preview data (src/preview/data.ts): if a payload stops matching the
// API contract, or silently becomes "demo", the pages hide it again and the review shows an empty
// screen instead of a layout.
import { describe, expect, it } from "vitest";
import type {
  AlertsOut,
  ForecastOut,
  LocationListOut,
  OverviewOut,
  RecommendationsOut,
  ReferenceOut,
  SearchOut,
  SpeciesListOut,
  TravelOut,
} from "../api/types";
import { PREVIEW_DATA } from "./flag";
import { previewResponse } from "./data";

const KL = { species_id: "sp-kembung", location_id: "loc-kl" };

function reference(values: Record<string, string> = KL): ReferenceOut {
  return previewResponse("/prices/reference", values) as ReferenceOut;
}

describe("design-preview data", () => {
  it("stays off under Vitest, so the suite keeps exercising the real request path", () => {
    expect(PREVIEW_DATA).toBe(false);
  });

  it("answers exactly the public paths the client calls", () => {
    const paths = [
      "/health",
      "/species",
      "/locations",
      "/overview",
      "/alerts",
      "/search",
      "/prices/reference",
      "/recommendations",
      "/forecast",
      "/travel/estimate",
    ];
    for (const path of paths) {
      expect(previewResponse(path), `${path} has no preview data`).toBeDefined();
    }
    expect(previewResponse("/me")).toBeUndefined();
    expect(previewResponse("/species/extra")).toBeUndefined();
  });

  it("marks nothing as demo, so every page renders the placeholder numbers", () => {
    const species = previewResponse("/species") as SpeciesListOut;
    const overview = previewResponse("/overview") as OverviewOut;
    const card = reference();

    expect(species.demo).toBe(false);
    expect(species.items.length).toBeGreaterThan(1);
    expect(overview.demo).toBe(false);
    expect(overview.suggestions).toHaveLength(5);
    expect(overview.suggestions.every((item) => item.demo === false)).toBe(true);
    expect(card.demo).toBe(false);
    expect(card.band?.demo).toBe(false);
    expect(card.chart?.demo).toBe(false);
    expect(card.band?.demo_label).toBeNull();
  });

  it("seeds the dashboard alerts the layout needs, labelled as placeholders", () => {
    const data = previewResponse("/alerts") as AlertsOut;
    expect(data.demo).toBe(false);
    expect(data.notice).toBeNull();
    expect(data.items.map((item) => item.kind)).toEqual(["weather", "festivity"]);
    expect(data.items.every((item) => item.demo === false && item.source === "Preview placeholder")).toBe(true);
    // A placeholder still obeys the rule: an alert never states a price.
    expect(data.items.some((item) => /RM\d/.test(item.body))).toBe(false);
  });

  it("gives the map markets with coordinates", () => {
    const locations = previewResponse("/locations") as LocationListOut;
    const pins = locations.items.filter((item) => item.has_coordinates);
    expect(pins.length).toBeGreaterThan(1);
    expect(pins.every((item) => item.lat !== null && item.lng !== null)).toBe(true);
  });

  it("returns a coherent band, 16 weekly points and a quote verdict", () => {
    const band = reference().band!;
    expect(band.p25).toBeLessThanOrEqual(band.median);
    expect(band.median).toBeLessThanOrEqual(band.p75);
    expect(band.record_count).toBeGreaterThan(0);
    expect(reference().chart?.points).toHaveLength(16);
    expect(reference().verdict).toBeNull();

    expect(reference({ ...KL, quote: "1" }).verdict?.kind).toBe("below");
    expect(reference({ ...KL, quote: "999" }).verdict?.kind).toBe("above");
    expect(reference({ ...KL, quote: String(band.median) }).verdict?.kind).toBe("within");
  });

  it("falls back to Kuala Lumpur when a market has no records, and says so", () => {
    const card = reference({ species_id: "sp-selar", location_id: "loc-pk-chow-kit" });
    expect(card.is_fallback).toBe(true);
    expect(card.requested_location.name).toBe("Pasar Chow Kit");
    expect(card.used_location?.id).toBe("loc-kl");
    expect(card.message).toBe("Data khusus Pasar Chow Kit belum tersedia. Rujukan Kuala Lumpur digunakan.");
    expect(card.band?.location.id).toBe("loc-kl");
  });

  it("answers from a market with its own records, without a fallback message", () => {
    const card = reference({ species_id: "sp-kembung", location_id: "loc-pk-ttdi" });
    expect(card.is_fallback).toBe(false);
    expect(card.message).toBeNull();
    expect(card.used_location?.name).toBe("Pasar Taman Tun Dr Ismail");
    expect(card.band?.location.id).toBe("loc-pk-ttdi");
    expect(card.band!.median).toBeGreaterThan(reference().band!.median);
  });

  it("offers grades where the catalog has them and scales the band with them", () => {
    const all = reference({ species_id: "sp-tenggiri" });
    expect(all.grades).toEqual(["A", "B"]);
    const gradeA = reference({ species_id: "sp-tenggiri", grade: "A" });
    const gradeB = reference({ species_id: "sp-tenggiri", grade: "B" });
    expect(gradeA.grade).toBe("A");
    expect(gradeA.band!.median).toBeGreaterThan(all.band!.median);
    expect(gradeB.band!.median).toBeLessThan(all.band!.median);
  });

  it("recommends only cheaper similar fish, with the profile differences", () => {
    const recs = previewResponse("/recommendations", KL) as RecommendationsOut;
    expect(recs.items.length).toBeGreaterThan(0);
    expect(recs.items.every((item) => item.savings_rm_per_kg > 0)).toBe(true);
    expect(recs.items.every((item) => item.demo === false)).toBe(true);

    const selar = recs.items.find((item) => item.species.id === "sp-selar");
    expect(selar?.differences).toContain("Tekstur: lembut → pejal");
    expect(selar!.median).toBeLessThan(reference().band!.median);
  });

  it("has no recommendation when nothing similar is cheaper", () => {
    const recs = previewResponse("/recommendations", {
      species_id: "sp-tongkol",
      location_id: "loc-kl",
    }) as RecommendationsOut;
    expect(recs.items).toHaveLength(0);
    expect(recs.empty_message).toBe("Tiada cadangan");
  });
  it("makes every dashboard suggestion renderable with a trend line", () => {
    const overview = previewResponse("/overview") as OverviewOut;
    for (const suggestion of overview.suggestions) {
      const card = reference({ species_id: suggestion.species.id, location_id: suggestion.location.id });
      expect(card.chart!.points.length).toBeGreaterThan(1);
      expect(card.band!.median).toBe(suggestion.median);
    }
  });

  it("covers the confident, ambiguous, not-found and empty search states", () => {
    const confident = previewResponse("/search", { q: "kembung" }) as SearchOut;
    expect(confident.status).toBe("confident");
    expect(confident.matches[0].name_ms).toBe("IKAN KEMBUNG");

    const ambiguous = previewResponse("/search", { q: "bawal" }) as SearchOut;
    expect(ambiguous.status).toBe("candidates");
    expect(ambiguous.matches).toHaveLength(2);
    expect(ambiguous.confirm_prompt).toBe("Adakah ini ikan yang anda maksudkan?");

    const missing = previewResponse("/search", { q: "zzz" }) as SearchOut;
    expect(missing.status).toBe("none");
    expect(missing.notice).toBe("Ikan tidak ditemui. Cuba nama lain.");

    expect((previewResponse("/search", { q: "  " }) as SearchOut).status).toBe("empty_query");
  });

  it("computes travel exactly like the backend, doubling only what depends on distance", () => {
    const oneWay = previewResponse("/travel/estimate", undefined, {
      mode: "kereta",
      distance_km: "20",
      fuel_efficiency_km_per_l: "10",
      fuel_price_rm_per_l: "2",
      toll_rm: "4",
      parking_rm: "3",
      fish_price_rm_per_kg: "18",
      qty_kg: "2",
    }) as TravelOut;

    // 20 km ÷ 10 km/l = 2 l → RM4 fuel, + RM4 toll + RM3 parking, and 2 kg × RM18 = RM36 fish.
    expect(oneWay.estimated).toBe(true);
    expect(oneWay.components.find((item) => item.key === "fuel_litres")?.value).toBe("2.00");
    expect(oneWay.travel_total.value).toBe("11.00");
    expect(oneWay.fish_cost.value).toBe("36.00");
    expect(oneWay.grand_total.value).toBe("47.00");
    expect(oneWay.effective_rm_per_kg.value).toBe("23.50");

    const bothWays = previewResponse("/travel/estimate", undefined, {
      mode: "kereta",
      distance_km: "20",
      fuel_efficiency_km_per_l: "10",
      fuel_price_rm_per_l: "2",
      toll_rm: "4",
      parking_rm: "3",
      return_trip: true,
    }) as TravelOut;
    expect(bothWays.travel_total.value).toBe("19.00");
    expect(bothWays.effective_rm_per_kg.value).toBeNull();

    // 18 km ÷ 12 km/l = 1.5 l → RM3.075 fuel, and 3.075 + 4 + 3 = RM10.075: the backend rounds
    // half-up, so the preview must show RM10.08 rather than the RM10.07 toFixed would produce.
    const tied = previewResponse("/travel/estimate", undefined, {
      mode: "kereta",
      distance_km: "18",
      fuel_efficiency_km_per_l: "12",
      fuel_price_rm_per_l: "2.05",
      toll_rm: "4",
      parking_rm: "3",
    }) as TravelOut;
    expect(tied.travel_total.value).toBe("10.08");
  });

  it("never invents a travel total from missing inputs", () => {
    const missing = previewResponse("/travel/estimate", undefined, {
      mode: "kereta",
      distance_km: "20",
    }) as TravelOut;
    expect(missing.estimated).toBe(false);
    expect(missing.message).toBe("Kos perjalanan belum dianggarkan");
    expect(missing.travel_total.value).toBeNull();
    expect(missing.travel_total.display).toBe("Belum dikira");

    expect((previewResponse("/travel/estimate", undefined, { mode: "pengangkutan_awam" }) as TravelOut).estimated).toBe(
      false,
    );

    const paidBus = previewResponse("/travel/estimate", undefined, {
      mode: "pengangkutan_awam",
      transit_fare_rm: "3.5",
      return_trip: true,
    }) as TravelOut;
    expect(paidBus.travel_total.value).toBe("7.00");
  });

  it("forecasts the week after the last history point", () => {
    const data = previewResponse("/forecast", { species_id: "sp-selar", location_id: "loc-kl" }) as ForecastOut;
    const prediction = data.prediction!;
    expect(data.available).toBe(true);
    expect(prediction.demo).toBe(false);
    expect(prediction.last_data_date).toBe("2026-10-25");
    expect(prediction.target_start).toBe("2026-10-26");
    expect(prediction.p10!).toBeLessThan(prediction.predicted_median);
    expect(prediction.p90!).toBeGreaterThan(prediction.predicted_median);

    const above = previewResponse("/forecast", {
      species_id: "sp-selar",
      location_id: "loc-kl",
      quote: "900",
    }) as ForecastOut;
    expect(above.p75_message).toContain("melebihi P75");
  });


});
