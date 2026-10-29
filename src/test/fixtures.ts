// Fixtures shaped like public FastAPI responses.
import type {
  AlertsOut,
  LocationListOut,
  OverviewOut,
  RecommendationsOut,
  ReferenceOut,
  SearchOut,
  SpeciesListOut,
  TravelOut,
  TravelValueOut,
} from "../api/types";

export const KEMBUNG = { id: "sp-kembung", name_ms: "IKAN KEMBUNG" };
export const KL = { id: "loc-kl", name: "Kuala Lumpur", level: "negeri" };
export const CHOW_KIT = { id: "loc-ck", name: "Pasar Chow Kit", level: "pasar" };

export const DISCLAIMER =
  "Cadangan ini bukan nasihat perubatan. Jika anda mempunyai alergi makanan, semak nama spesies, label produk dan risiko pencemaran silang dengan penjual atau profesional kesihatan.";

export const species: SpeciesListOut = {
  count: 1,
  demo: false,
  items: [
    {
      id: KEMBUNG.id,
      code: "IKAN_KEMBUNG",
      name_ms: KEMBUNG.name_ms,
      name_en: null,
      allergen_groups: ["ikan_bersirip"],
      aliases: [{ alias: "IKAN KEMBUNG", language: "raw" }],
      profile: null,
    },
  ],
};

export const locations: LocationListOut = {
  count: 2,
  items: [
    { id: KL.id, name: KL.name, level: "negeri", parent_id: null, lat: null, lng: null, has_coordinates: false },
    {
      id: CHOW_KIT.id,
      name: CHOW_KIT.name,
      level: "pasar",
      parent_id: KL.id,
      lat: null,
      lng: null,
      has_coordinates: false,
    },
  ],
};

export const searchConfident: SearchOut = {
  query: "kembung",
  status: "confident",
  matches: [{ species_id: KEMBUNG.id, name_ms: KEMBUNG.name_ms, matched_alias: "IKAN KEMBUNG", score: 0.9 }],
  backend: "fuzzy",
  degraded: false,
  notice: null,
  confirm_prompt: null,
};

export function reference(requested = KL, quote: number | null = null): ReferenceOut {
  const fallback = requested.id !== KL.id;
  const quoteOut = quote !== null ? { value: quote, source_label: "Input pengguna" as const, demo: false } : null;

  return {
    species: KEMBUNG,
    requested_location: requested,
    used_location: KL,
    available: true,
    is_fallback: fallback,
    message: fallback ? `Data khusus ${requested.name} belum tersedia. Rujukan Kuala Lumpur digunakan.` : null,
    band: {
      p25: 52.05,
      median: 55.93,
      p75: 70.43,
      record_count: 800,
      confidence_level: "tinggi",
      period_start: "2026-07-06",
      period_end: "2026-10-25",
      grade: null,
      band_source: "PUBLISHED_TEST_RECORDS",
      location: KL,
      source_label: "Harga sejarah",
      demo: false,
      demo_label: null,
    },
    grade: null,
    grades: [],
    quote: quoteOut,
    quote_error: null,
    verdict: quote !== null ? { kind: "below", text: "Di bawah julat sejarah", icon: "⬇️" } : null,
    chart: null,
    chart_notice: null,
    demo: false,
  };
}

export const recsEmpty: RecommendationsOut = {
  species: KEMBUNG,
  location: KL,
  items: [],
  empty_message: "Tiada cadangan",
  empty_reason: null,
  original_allergy_match: false,
  allergy_caution: null,
  disclaimer: DISCLAIMER,
  personalised: false,
  notice: null,
};

export const recsWithItem: RecommendationsOut = {
  ...recsEmpty,
  empty_message: null,
  items: [
    {
      species: { id: "sp-selar", name_ms: "IKAN SELAR" },
      reason: "Ikan serupa yang disahkan dengan median lebih rendah.",
      differences: ["Tekstur: lembut → pejal"],
      p25: 20,
      median: 22,
      p75: 25,
      savings_rm_per_kg: 33.93,
      record_count: 120,
      confidence_level: "sederhana",
      location_name: "Kuala Lumpur",
      period_start: "2026-07-06",
      period_end: "2026-10-25",
      similarity_score: 0.8,
      over_budget: true,
      over_budget_label: "Melebihi bajet",
      source_label: "Harga sejarah",
      demo: false,
      demo_label: null,
    },
  ],
};

const travelValueFixture = (key: string, name: string, unit: string): TravelValueOut => ({
  key,
  name,
  value: null,
  display: "Belum dikira",
  unit,
  source_label: "Anggaran perjalanan",
  display_label: "Anggaran perjalanan · Input pengguna",
  demo: false,
  note: null,
});

export const travelNotEstimated: TravelOut = {
  mode: "kereta",
  fuel_type: "RON95",
  return_trip: false,
  estimated: false,
  message: "Kos perjalanan belum dianggarkan",
  inputs: [],
  components: [travelValueFixture("fuel_cost", "Kos bahan api", "RM")],
  travel_total: travelValueFixture("travel_total", "Jumlah kos perjalanan", "RM"),
  fish_cost: travelValueFixture("fish_cost", "Kos ikan", "RM"),
  grand_total: travelValueFixture("grand_total", "Jumlah keseluruhan", "RM"),
  effective_rm_per_kg: travelValueFixture("effective_rm_per_kg", "Kos sebenar per kg", "RM/kg"),
  fare_source: null,
  fare_source_detail: null,
  notes: [
    "Kos perjalanan dipaparkan berasingan daripada kos ikan.",
    "Kos perjalanan tidak digunakan dalam ramalan harga.",
  ],
  demo: false,
};

/** What the backend returns today: an Open-Meteo rain day plus the next public holiday. */
export const alerts: AlertsOut = {
  items: [
    {
      id: "weather-rain-2026-10-29",
      kind: "weather",
      title: "Hujan lebat dijangka",
      body: "Ramalan Open-Meteo menunjukkan 15.4 mm hujan terkumpul. HargaIkan menandakan hari pada 10 mm atau lebih.",
      source: "Open-Meteo (ramalan cuaca Kuala Lumpur, bukan amaran rasmi MET Malaysia)",
      valid_from: "2026-10-29",
      valid_to: "2026-10-29",
      demo: false,
    },
    {
      id: "festivity-2026-11-08-deepavali",
      kind: "festivity",
      title: "Deepavali",
      body: "Perayaan ini 10 hari dari sekarang. HargaIkan menyenaraikannya daripada kalendar cuti umum, bukan ramalan harga.",
      source: "Kalendar cuti umum Malaysia (kabinet.gov.my)",
      valid_from: "2026-11-08",
      valid_to: "2026-11-08",
      demo: false,
    },
  ],
  notice: null,
  demo: false,
};

/** What the backend returns when the weather API cannot be read: the calendar still reports. */
export const alertsWeatherUnavailable: AlertsOut = {
  items: [alerts.items[1]],
  notice: "Data cuaca (Open-Meteo) tidak dapat dibaca sekarang.",
  demo: false,
};

export const overview: OverviewOut = {
  species_count: 10,
  premise_count: 8,
  latest_period: "2026-10-25",
  demo: false,
  demo_label: null,
  notice: null,
  legend: [],
  suggestions_title: "Ikan dengan rekod harga terbanyak di Kuala Lumpur",
  suggestions: [],
  suggestions_notice: null,
};
