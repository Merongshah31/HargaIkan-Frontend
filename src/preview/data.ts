// TEMPORARY design-preview data. Frontend-only hardcode: while it is on, no request leaves the
// browser and every number on screen comes from this file.
//
// Why it exists: the pages are built against the public FastAPI contract, and the backend has no
// published price records yet, so every price block correctly renders "not available yet" and the
// layouts cannot be reviewed with numbers in them. This module returns a complete set of hardcoded
// API responses so the real components, tables, chart, map and states can be judged on screen.
//
// REMOVING IT (every hook, so nothing is left behind):
//   1. delete this folder                 src/preview/
//   2. delete the ribbon                  src/components/PreviewRibbon.tsx
//   3. src/api/client.ts                  drop the import and the `if (PREVIEW_DATA) { ... }` block
//   4. src/components/Layout.tsx          drop <PreviewRibbon />
//   5. src/styles.css, src/messages.ts    drop the .preview-ribbon rules and PREVIEW_RIBBON
//   6. src/vite-env.d.ts, .env.example    drop VITE_PREVIEW_DATA
//
// The numbers are illustrative placeholders chosen so that tables, axes and charts look realistic.
// They are not market prices, not PriceCatcher records and not measurements of anything, so they
// must never reach users as published prices: PREVIEW_DATA (src/preview/flag.ts) is false in every
// production build unless VITE_PREVIEW_DATA=1 is set deliberately for a throwaway preview
// deployment, and the module is then dropped from the bundle.

import type {
  AlertsOut,
  ConfidenceLevel,
  ForecastOut,
  HealthOut,
  LocationListOut,
  LocationOut,
  LocationRef,
  OverviewOut,
  PredictionOut,
  RecommendationsOut,
  RecommendationItemOut,
  ReferenceOut,
  SearchMatchOut,
  SearchOut,
  SpeciesListOut,
  SpeciesOut,
  SuggestionOut,
  TravelIn,
  TravelOut,
  TravelValueOut,
  VerdictOut,
  WeeklyPointOut,
} from "../api/types";

export type PreviewQuery = Record<string, string | number | null | undefined>;

// --- Shape of the preview series ----------------------------------------------------------------

/** 16 week starts (Mondays) ending in the week before the review date. */
const WEEKS = [
  "2026-07-06", "2026-07-13", "2026-07-20", "2026-07-27", "2026-08-03", "2026-08-10",
  "2026-08-17", "2026-08-24", "2026-08-31", "2026-09-07", "2026-09-14", "2026-09-21",
  "2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19",
];
const PERIOD_END = "2026-10-25";
/** Hand-written seasonal shape (a festival run-up, then a dip), one entry per week above. */
const WAVE = [1.0, 0.99, 1.01, 1.03, 1.02, 1.04, 1.07, 1.06, 1.03, 1.02, 1.0, 0.97, 0.96, 0.99, 1.03, 1.06];
/** Records behind each weekly median. */
const WEEKLY_RECORDS = [42, 38, 51, 47, 44, 58, 63, 55, 49, 46, 52, 41, 37, 45, 57, 61];

// 2 dp, half-up as the backend's Decimal ROUND_HALF_UP does (JS toFixed would give 10.07 here).
const round2 = (value: number): number => Math.round(value * 100 + 1e-9) / 100;

// --- Locations ----------------------------------------------------------------------------------

interface LocationSeed {
  id: string;
  name: string;
  level: LocationOut["level"];
  parent_id: string | null;
  lat?: number;
  lng?: number;
  /** Placeholder price multiplier for this market. */
  factor?: number;
}

const LOCATION_SEEDS: LocationSeed[] = [
  { id: "loc-my", name: "Malaysia", level: "nasional", parent_id: null },
  { id: "loc-kl", name: "Kuala Lumpur", level: "negeri", parent_id: "loc-my" },
  { id: "loc-sel", name: "Selangor", level: "negeri", parent_id: "loc-my" },
  { id: "loc-kaw-titiwangsa", name: "Titiwangsa", level: "kawasan", parent_id: "loc-kl" },
  { id: "loc-kaw-damansara", name: "Damansara", level: "kawasan", parent_id: "loc-kl" },
  { id: "loc-kaw-cheras", name: "Cheras", level: "kawasan", parent_id: "loc-kl" },
  { id: "loc-kaw-sri-petaling", name: "Sri Petaling", level: "kawasan", parent_id: "loc-kl" },
  { id: "loc-pk-chow-kit", name: "Pasar Chow Kit", level: "pasar", parent_id: "loc-kaw-titiwangsa", lat: 3.1667, lng: 101.6943 },
  { id: "loc-pk-ttdi", name: "Pasar Taman Tun Dr Ismail", level: "pasar", parent_id: "loc-kaw-damansara", lat: 3.1425, lng: 101.6267, factor: 1.05 },
  { id: "loc-pk-cheras", name: "Pasar Cheras", level: "pasar", parent_id: "loc-kaw-cheras", lat: 3.0764, lng: 101.744, factor: 1.02 },
  { id: "loc-pk-sri-petaling", name: "Pasar Sri Petaling", level: "pasar", parent_id: "loc-kaw-sri-petaling", lat: 3.0626, lng: 101.69, factor: 0.97 },
  { id: "loc-pr-maluri", name: "Pasar Mini Maluri", level: "premis", parent_id: "loc-kaw-cheras", lat: 3.1247, lng: 101.7333, factor: 1.08 },
  { id: "loc-pr-sri-petaling", name: "Pasar Mini Sri Petaling", level: "premis", parent_id: "loc-kaw-sri-petaling", lat: 3.0631, lng: 101.6912, factor: 1.08 },
];

const LOCATIONS: LocationOut[] = LOCATION_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  level: seed.level,
  parent_id: seed.parent_id,
  lat: seed.lat ?? null,
  lng: seed.lng ?? null,
  has_coordinates: seed.lat !== undefined,
}));

const locationById = new Map(LOCATION_SEEDS.map((seed) => [seed.id, seed]));

function asRef(id: string): LocationRef {
  const seed = locationById.get(id);
  return seed ? { id: seed.id, name: seed.name, level: seed.level } : { id, name: id, level: "pasar" };
}

const KUALA_LUMPUR = "loc-kl";

/** Markets the review wants to see in the "nothing here yet, using the state reference" state. */
const NO_DATA_LOCATIONS = new Set(["loc-pk-chow-kit", "loc-sel"]);

/** The market a request is answered from: the requested one when it has records, else Kuala Lumpur. */
function resolveLocation(requestedId: string): { ref: LocationRef; isFallback: boolean } {
  const known = locationById.has(requestedId);
  const isFallback = !known || NO_DATA_LOCATIONS.has(requestedId);
  return { ref: asRef(isFallback ? KUALA_LUMPUR : requestedId), isFallback };
}

// --- Species ------------------------------------------------------------------------------------

interface SpeciesSeed {
  id: string;
  code: string;
  name_ms: string;
  name_en: string;
  scientific: string;
  /** Placeholder Kuala Lumpur median in RM/kg. */
  base: number;
  /** Grades this species is recorded with; the first is the default view. */
  grades?: string[];
  /**
   * Multiplier on the last week only, so the dashboard review can see a falling row (green) as well
   * as a rising one (red). It never touches the other 15 weeks, so bands stay comparable.
   */
  tail?: number;
  texture: string;
  taste: string;
  bone_level: string;
  cooking_methods: string[];
}

// Names match the backend demo catalog (pipeline/ingest.py DEMO_SPECIES_NAMES); the drafted
// profiles mirror data/curated/fish_profiles.yaml. Only the prices are made up for the review.
const SPECIES_SEEDS: SpeciesSeed[] = [
  { id: "sp-kembung", code: "IKAN_KEMBUNG", name_ms: "IKAN KEMBUNG", name_en: "Indian mackerel", scientific: "Rastrelliger kanagurta", base: 18.5, tail: 1.02, texture: "lembut", taste: "berlemak, rasa ikan kuat", bone_level: "sederhana", cooking_methods: ["goreng", "bakar", "masak asam pedas"] },
  { id: "sp-selar", code: "IKAN_SELAR", name_ms: "IKAN SELAR", name_en: "Yellowtail scad", scientific: "Atule mate", base: 15.2, tail: 0.97, texture: "pejal", taste: "manis sederhana", bone_level: "sederhana", cooking_methods: ["goreng", "bakar", "masak asam"] },
  { id: "sp-tongkol", code: "IKAN_TONGKOL", name_ms: "IKAN TONGKOL", name_en: "Longtail tuna", scientific: "Thunnus tonggol", base: 12.4, tail: 0.95, texture: "pejal", taste: "rasa ikan kuat", bone_level: "sedikit", cooking_methods: ["masak kicap", "gulai", "sambal"] },
  { id: "sp-bawal-hitam", code: "IKAN_BAWAL_HITAM", name_ms: "IKAN BAWAL HITAM", name_en: "Black pomfret", scientific: "Parastromateus niger", base: 28.9, texture: "lembut", taste: "manis sederhana", bone_level: "sederhana", cooking_methods: ["goreng", "stim", "masak asam"] },
  { id: "sp-bawal-putih", code: "IKAN_BAWAL_PUTIH", name_ms: "IKAN BAWAL PUTIH", name_en: "Silver pomfret", scientific: "Pampus argenteus", base: 42.5, grades: ["A", "B"], texture: "lembut", taste: "manis", bone_level: "sedikit", cooking_methods: ["stim", "goreng", "masak asam"] },
  { id: "sp-merah", code: "IKAN_MERAH", name_ms: "IKAN MERAH", name_en: "Red snapper", scientific: "Lutjanus spp.", base: 31.8, texture: "pejal", taste: "manis", bone_level: "sedikit", cooking_methods: ["kari", "stim", "bakar"] },
  { id: "sp-jenahak", code: "IKAN_JENAHAK", name_ms: "IKAN JENAHAK", name_en: "Golden snapper", scientific: "Lutjanus johnii", base: 35.6, texture: "pejal", taste: "manis", bone_level: "sedikit", cooking_methods: ["stim", "kari", "bakar"] },
  { id: "sp-siakap", code: "IKAN_SIAKAP", name_ms: "IKAN SIAKAP", name_en: "Barramundi", scientific: "Lates calcarifer", base: 24.9, texture: "lembut", taste: "manis sederhana", bone_level: "sedikit", cooking_methods: ["stim", "goreng", "masak tiga rasa"] },
  { id: "sp-tenggiri", code: "IKAN_TENGGIRI", name_ms: "IKAN TENGGIRI", name_en: "Spanish mackerel", scientific: "Scomberomorus commerson", base: 33.4, grades: ["A", "B"], texture: "pejal", taste: "manis", bone_level: "sedikit", cooking_methods: ["goreng", "masak asam pedas", "kari"] },
  { id: "sp-kerisi", code: "IKAN_KERISI", name_ms: "IKAN KERISI", name_en: "Threadfin bream", scientific: "Nemipterus spp.", base: 19.7, tail: 0.98, texture: "lembut", taste: "manis", bone_level: "sederhana", cooking_methods: ["goreng", "masak asam", "sup"] },
];

const speciesById = new Map(SPECIES_SEEDS.map((seed) => [seed.id, seed]));

function toSpecies(seed: SpeciesSeed): SpeciesOut {
  return {
    id: seed.id,
    code: seed.code,
    name_ms: seed.name_ms,
    name_en: seed.name_en,
    allergen_groups: ["ikan_bersirip"],
    aliases: [
      { alias: seed.name_ms, language: "raw" },
      { alias: seed.name_en, language: "en" },
      { alias: seed.scientific, language: "scientific" },
    ],
    profile: {
      texture: seed.texture,
      taste: seed.taste,
      bone_level: seed.bone_level,
      cooking_methods: seed.cooking_methods,
      allergen_groups: ["ikan_bersirip"],
      notes: null,
    },
  };
}

const asSpeciesRef = (id: string) => {
  const seed = speciesById.get(id);
  return { id, name_ms: seed?.name_ms ?? id };
};

// --- Weekly series and bands --------------------------------------------------------------------

interface Series {
  points: WeeklyPointOut[];
  p25: number;
  median: number;
  p75: number;
  record_count: number;
  confidence: ConfidenceLevel;
}

const GRADE_FACTOR: Record<string, number> = { A: 1.12, B: 0.9 };

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const position = (sorted.length - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return low === high ? sorted[low] : sorted[low] + (sorted[high] - sorted[low]) * (position - low);
}

/** One weekly series per species × market (× grade), so tables, chart and band always agree. */
function seriesFor(speciesId: string, locationId: string, grade: string | null): Series | null {
  const species = speciesById.get(speciesId);
  const location = locationById.get(locationId);
  if (!species || !location) return null;

  const factor = (location.factor ?? 1) * (grade ? GRADE_FACTOR[grade] ?? 1 : 1);
  const values = WAVE.map((wave, index) =>
    round2(species.base * factor * wave * (index === WAVE.length - 1 ? species.tail ?? 1 : 1)),
  );
  // Cheaper species sell in bigger volumes, so their weeks carry more records.
  const volume = 0.6 + Math.max(0, 60 - species.base) / 100;
  const counts = WEEKLY_RECORDS.map((n) => Math.max(1, Math.round(n * volume * (grade ? 0.55 : 1))));
  const points = WEEKS.map((week_start, index) => ({
    week_start,
    median: values[index],
    record_count: counts[index],
  }));

  const sorted = [...values].sort((left, right) => left - right);
  const record_count = counts.reduce((total, n) => total + n, 0);
  return {
    points,
    p25: round2(quantile(sorted, 0.25)),
    median: round2(quantile(sorted, 0.5)),
    p75: round2(quantile(sorted, 0.75)),
    record_count,
    confidence: record_count >= 600 ? "tinggi" : record_count >= 250 ? "sederhana" : "rendah",
  };
}

// --- Quote verdict ------------------------------------------------------------------------------

const ICON_BELOW = "⬇️";
const ICON_WITHIN = "✅";
const ICON_ABOVE = "⬆️";
const ICON_NO_DATA = "ℹ️";

function verdictFor(price: number, band: { p25: number; p75: number } | null): VerdictOut {
  if (!band) return { kind: "no_data", text: "Data belum tersedia", icon: ICON_NO_DATA };
  if (price < band.p25) return { kind: "below", text: "Di bawah julat sejarah", icon: ICON_BELOW };
  if (price > band.p75) return { kind: "above", text: "Di atas julat sejarah", icon: ICON_ABOVE };
  return { kind: "within", text: "Dalam julat sejarah", icon: ICON_WITHIN };
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// --- /prices/reference (band, verdict, chart) ---------------------------------------------------

/** Mirrors the backend: a market with no records falls back to the state reference and says so. */
function reference(query?: PreviewQuery): ReferenceOut {
  const speciesId = String(query?.species_id ?? "");
  const requestedId = String(query?.location_id ?? "");
  const grade = query?.grade ? String(query.grade) : null;
  const quote = numberOrNull(query?.quote);
  const seed = speciesById.get(speciesId);
  const requestedRef = asRef(requestedId);

  const { ref: usedRef, isFallback } = resolveLocation(requestedId);
  const series = seriesFor(speciesId, usedRef.id, grade);
  const quoteOut: ReferenceOut["quote"] =
    quote === null ? null : { value: quote, source_label: "Input pengguna", demo: false };

  if (!seed || !series) {
    return {
      species: asSpeciesRef(speciesId),
      requested_location: requestedRef,
      used_location: usedRef,
      available: false,
      is_fallback: false,
      message: "Data harga ikan asal belum tersedia.",
      band: null,
      grade,
      grades: [],
      quote: quoteOut,
      quote_error: null,
      verdict: null,
      chart: null,
      chart_notice: null,
      demo: false,
    };
  }

  const band: ReferenceOut["band"] = {
    p25: series.p25,
    median: series.median,
    p75: series.p75,
    record_count: series.record_count,
    confidence_level: series.confidence,
    period_start: WEEKS[0],
    period_end: PERIOD_END,
    grade,
    band_source: "PREVIEW_PLACEHOLDER",
    location: usedRef,
    source_label: "Harga sejarah",
    demo: false,
    demo_label: null,
  };
  const chart: ReferenceOut["chart"] = {
    location: usedRef,
    points: series.points,
    band_p25: series.p25,
    band_p75: series.p75,
    source_label: "Harga sejarah",
    demo: false,
    quote: quoteOut,
  };

  return {
    species: asSpeciesRef(speciesId),
    requested_location: requestedRef,
    used_location: usedRef,
    available: true,
    is_fallback: isFallback,
    message: isFallback
      ? `Data khusus ${requestedRef.name} belum tersedia. Rujukan ${usedRef.name} digunakan.`
      : null,
    band,
    grade,
    grades: seed.grades ?? [],
    quote: quoteOut,
    quote_error: null,
    verdict: quote === null ? null : verdictFor(quote, band),
    chart,
    chart_notice: null,
    demo: false,
  };
}

// --- /recommendations ---------------------------------------------------------------------------

/** Hardcoded "reviewed as similar" pairs, mirroring the shape of data/curated/fish_similarity.yaml. */
const SIMILAR: Record<string, { id: string; score: number }[]> = {
  "sp-kembung": [{ id: "sp-selar", score: 0.82 }, { id: "sp-kerisi", score: 0.71 }, { id: "sp-tongkol", score: 0.64 }],
  "sp-selar": [{ id: "sp-kembung", score: 0.82 }, { id: "sp-tongkol", score: 0.69 }],
  "sp-tongkol": [{ id: "sp-selar", score: 0.69 }, { id: "sp-kembung", score: 0.64 }],
  "sp-bawal-putih": [{ id: "sp-bawal-hitam", score: 0.78 }, { id: "sp-jenahak", score: 0.61 }],
  "sp-bawal-hitam": [{ id: "sp-siakap", score: 0.74 }, { id: "sp-kerisi", score: 0.6 }],
  "sp-merah": [{ id: "sp-jenahak", score: 0.8 }, { id: "sp-kerisi", score: 0.67 }],
  "sp-jenahak": [{ id: "sp-merah", score: 0.8 }, { id: "sp-siakap", score: 0.7 }],
  "sp-siakap": [{ id: "sp-bawal-hitam", score: 0.74 }, { id: "sp-kerisi", score: 0.62 }],
  "sp-tenggiri": [{ id: "sp-jenahak", score: 0.72 }, { id: "sp-merah", score: 0.66 }],
  "sp-kerisi": [{ id: "sp-kembung", score: 0.71 }, { id: "sp-selar", score: 0.68 }],
};

const DISCLAIMER =
  "Cadangan ini bukan nasihat perubatan. Jika anda mempunyai alergi makanan, semak nama spesies, label produk dan risiko pencemaran silang dengan penjual atau profesional kesihatan.";

const DIFF_LABELS: Record<string, string> = {
  texture: "Tekstur",
  taste: "Rasa",
  bone_level: "Tulang",
  cooking_methods: "Cara masakan",
};

/** "Tekstur: lembut → pejal" for every profile field that differs. */
function differencesBetween(from: SpeciesSeed, to: SpeciesSeed): string[] {
  const diffs: string[] = [];
  for (const field of ["texture", "taste", "bone_level"] as const) {
    if (from[field] !== to[field]) diffs.push(`${DIFF_LABELS[field]}: ${from[field]} → ${to[field]}`);
  }
  return diffs;
}

function recommendations(query?: PreviewQuery): RecommendationsOut {
  const speciesId = String(query?.species_id ?? "");
  const requestedId = String(query?.location_id ?? "");
  const { ref: usedRef } = resolveLocation(requestedId);
  const seed = speciesById.get(speciesId);
  const base = seriesFor(speciesId, usedRef.id, null);
  const items: RecommendationItemOut[] = [];

  if (seed && base) {
    for (const candidate of SIMILAR[speciesId] ?? []) {
      const other = speciesById.get(candidate.id);
      const series = seriesFor(candidate.id, usedRef.id, null);
      if (!other || !series) continue;
      const savings = round2(base.median - series.median);
      if (savings <= 0) continue;
      items.push({
        species: asSpeciesRef(other.id),
        reason: "Ikan serupa yang disahkan dengan median lebih rendah.",
        differences: differencesBetween(seed, other),
        p25: series.p25,
        median: series.median,
        p75: series.p75,
        savings_rm_per_kg: savings,
        record_count: series.record_count,
        confidence_level: series.confidence,
        location_name: usedRef.name,
        period_start: WEEKS[0],
        period_end: PERIOD_END,
        similarity_score: candidate.score,
        over_budget: false,
        over_budget_label: "Dalam bajet",
        source_label: "Harga sejarah",
        demo: false,
        demo_label: null,
      });
      if (items.length === 3) break;
    }
  }

  return {
    species: asSpeciesRef(speciesId),
    location: usedRef,
    items,
    empty_message: items.length === 0 ? "Tiada cadangan" : null,
    empty_reason: items.length === 0 ? "Tiada ikan serupa yang disahkan lebih murah di lokasi ini." : null,
    original_allergy_match: false,
    allergy_caution: null,
    disclaimer: DISCLAIMER,
    personalised: false,
    notice: null,
  };
}

// --- /overview (dashboard) ----------------------------------------------------------------------

function overview(): OverviewOut {
  const ranked = SPECIES_SEEDS
    .map((seed) => ({ seed, series: seriesFor(seed.id, KUALA_LUMPUR, null) }))
    .filter((entry): entry is { seed: SpeciesSeed; series: Series } => entry.series !== null)
    .sort((left, right) => right.series.record_count - left.series.record_count)
    .slice(0, 5);

  const suggestions: SuggestionOut[] = ranked.map(({ seed, series }) => ({
    species: asSpeciesRef(seed.id),
    location: asRef(KUALA_LUMPUR),
    p25: series.p25,
    median: series.median,
    p75: series.p75,
    record_count: series.record_count,
    confidence_level: series.confidence,
    period_start: WEEKS[0],
    period_end: PERIOD_END,
    source_label: "Harga sejarah",
    demo: false,
    demo_label: null,
  }));

  return {
    species_count: SPECIES_SEEDS.length,
    premise_count: LOCATION_SEEDS.filter((seed) => seed.level === "pasar" || seed.level === "premis").length,
    latest_period: PERIOD_END,
    demo: false,
    demo_label: null,
    notice: null,
    legend: [],
    suggestions_title: "Ikan dengan rekod harga terbanyak di Kuala Lumpur",
    suggestions,
    suggestions_notice: null,
  };
}

// --- /search ------------------------------------------------------------------------------------

/** Alias lookup so the confident and "did you mean" states can both be reviewed. */
function search(rawQuery: string): SearchOut {
  const query = rawQuery.trim();
  if (!query) {
    return {
      query,
      status: "empty_query",
      matches: [],
      backend: "fuzzy",
      degraded: false,
      notice: "Sila taip nama ikan.",
      confirm_prompt: null,
    };
  }

  const needle = query.toLowerCase();
  const matches: SearchMatchOut[] = [];
  for (const seed of SPECIES_SEEDS) {
    const alias = [seed.name_ms, seed.name_en, seed.scientific].find((value) =>
      value.toLowerCase().includes(needle),
    );
    if (!alias) continue;
    const score = alias.toLowerCase() === needle ? 1 : round2(0.6 + 0.4 * (needle.length / alias.length));
    matches.push({ species_id: seed.id, name_ms: seed.name_ms, matched_alias: alias, score });
  }
  matches.sort((left, right) => right.score - left.score);

  if (matches.length === 0) {
    return {
      query,
      status: "none",
      matches: [],
      backend: "fuzzy",
      degraded: false,
      notice: "Ikan tidak ditemui. Cuba nama lain.",
      confirm_prompt: null,
    };
  }

  return {
    query,
    status: matches.length === 1 ? "confident" : "candidates",
    matches,
    backend: "fuzzy",
    degraded: false,
    notice: null,
    confirm_prompt: matches.length === 1 ? null : "Adakah ini ikan yang anda maksudkan?",
  };
}

// --- /forecast ----------------------------------------------------------------------------------

/** The week after PERIOD_END (2026-10-25 is a Sunday). */
const NEXT_WEEK_START = "2026-10-26";
const NEXT_WEEK_END = "2026-11-01";

function forecast(query?: PreviewQuery): ForecastOut {
  const speciesId = String(query?.species_id ?? "");
  const requestedId = String(query?.location_id ?? "");
  const quote = numberOrNull(query?.quote);
  const { ref: usedRef } = resolveLocation(requestedId);
  const seed = speciesById.get(speciesId);
  const series = seriesFor(speciesId, usedRef.id, null);
  const quoteOut: ForecastOut["quote"] =
    quote === null ? null : { value: quote, source_label: "Input pengguna", demo: false };

  if (!seed || !series) {
    return {
      species: asSpeciesRef(speciesId),
      location: usedRef,
      available: false,
      message: "Ramalan belum tersedia.",
      prediction: null,
      p75_message: null,
      early_buy_message: null,
      quote: quoteOut,
      quote_error: null,
    };
  }

  const points = series.points;
  const last = points[points.length - 1].median;
  const previous = points[points.length - 2].median;
  const predictedMedian = round2(last + (last - previous));
  const error = round2(Math.max(0.4, last * 0.04));
  const prediction: PredictionOut = {
    predicted_median: predictedMedian,
    p10: round2(predictedMedian - error * 1.6),
    p90: round2(predictedMedian + error * 1.6),
    method: "trend",
    model_version: "preview-1",
    mae: error,
    target_start: NEXT_WEEK_START,
    target_end: NEXT_WEEK_END,
    last_data_date: PERIOD_END,
    is_baseline: false,
    location: usedRef,
    source_label: "Anggaran model",
    demo: false,
  };

  return {
    species: asSpeciesRef(speciesId),
    location: usedRef,
    available: true,
    message: null,
    prediction,
    p75_message:
      quote !== null && quote > series.p75
        ? "Julat anggaran menunjukkan harga mungkin melebihi P75 sejarah dalam tempoh ini."
        : null,
    early_buy_message: null,
    quote: quoteOut,
    quote_error: null,
  };
}

// --- /health ------------------------------------------------------------------------------------

const health: HealthOut = { status: "ok", backend: "memory", demo: false, version: "preview" };


// --- /travel/estimate ---------------------------------------------------------------------------

const TRAVEL_LABELS: Record<string, string> = {
  distance_km: "Jarak sehala (km)",
  fuel_efficiency_km_per_l: "Kecekapan bahan api (km/l)",
  fuel_price_rm_per_l: "Harga bahan api (RM/l)",
  toll_rm: "Tol",
  parking_rm: "Letak kereta",
  transit_fare_rm: "Tambang",
  fuel_litres: "Bahan api digunakan (l)",
  fuel_cost: "Kos bahan api",
  travel_total: "Jumlah kos perjalanan",
  fish_price_rm_per_kg: "Harga ikan (RM/kg)",
  qty_kg: "Kuantiti (kg)",
  fish_cost: "Kos ikan",
  grand_total: "Jumlah keseluruhan",
  effective_rm_per_kg: "Kos sebenar per kg",
};

const TRAVEL_UNITS: Record<string, string> = {
  distance_km: "km",
  fuel_efficiency_km_per_l: "km/l",
  fuel_price_rm_per_l: "RM/l",
  fuel_litres: "l",
  qty_kg: "kg",
  fish_price_rm_per_kg: "RM/kg",
  effective_rm_per_kg: "RM/kg",
};

const TRAVEL_COMPUTED_LABEL = "Anggaran perjalanan · Input pengguna";
const TRAVEL_NOT_ESTIMATED = "Kos perjalanan belum dianggarkan";
const NOT_COMPUTED = "Belum dikira";

function travelValue(
  key: string,
  value: number | null,
  source: TravelValueOut["source_label"],
  unit?: string,
  note: string | null = null,
): TravelValueOut {
  const rounded = value === null ? null : round2(value);
  const text = rounded === null ? null : rounded.toFixed(2);
  return {
    key,
    name: TRAVEL_LABELS[key] ?? key,
    value: text,
    display: text ?? NOT_COMPUTED,
    unit: unit ?? TRAVEL_UNITS[key] ?? "RM",
    source_label: source,
    display_label: TRAVEL_COMPUTED_LABEL,
    demo: false,
    note,
  };
}

/** Same arithmetic as core/travel_calc.py: fuel, toll and fare double on a return trip, parking */
/** is paid once per visit, and nothing is invented when an input is missing. */
function travel(raw: unknown): TravelOut {
  const input = (raw ?? {}) as Partial<TravelIn>;
  const mode = input.mode === "pengangkutan_awam" ? "pengangkutan_awam" : "kereta";
  const returnTrip = Boolean(input.return_trip);
  const multiplier = returnTrip ? 2 : 1;

  const distance = numberOrNull(input.distance_km);
  const efficiency = numberOrNull(input.fuel_efficiency_km_per_l);
  const fuelPrice = numberOrNull(input.fuel_price_rm_per_l);
  const toll = numberOrNull(input.toll_rm) ?? 0;
  const parking = numberOrNull(input.parking_rm) ?? 0;
  const fare = numberOrNull(input.transit_fare_rm);
  const fishPrice = numberOrNull(input.fish_price_rm_per_kg);
  const qty = numberOrNull(input.qty_kg);

  let litres: number | null = null;
  let fuelCost: number | null = null;
  let travelTotal: number | null = null;
  if (mode === "kereta") {
    if (distance !== null && efficiency !== null && efficiency > 0 && fuelPrice !== null) {
      litres = (distance / efficiency) * multiplier;
      fuelCost = litres * fuelPrice;
      travelTotal = fuelCost + toll * multiplier + parking;
    }
  } else if (fare !== null) {
    travelTotal = fare * multiplier;
  }

  const fishCost = fishPrice !== null && qty !== null ? fishPrice * qty : null;
  const grandTotal = fishCost !== null && travelTotal !== null ? fishCost + travelTotal : null;
  const effective = grandTotal !== null && qty !== null && qty > 0 ? grandTotal / qty : null;

  const inputs: TravelValueOut[] = [];
  if (mode === "kereta") {
    if (distance !== null) inputs.push(travelValue("distance_km", distance, "Input pengguna"));
    if (efficiency !== null) inputs.push(travelValue("fuel_efficiency_km_per_l", efficiency, "Input pengguna"));
    if (fuelPrice !== null) {
      inputs.push(travelValue("fuel_price_rm_per_l", fuelPrice, "Input pengguna", "RM/l", input.fuel_type ?? "RON95"));
    }
    if (toll > 0) inputs.push(travelValue("toll_rm", toll, "Input pengguna", "RM"));
    if (parking > 0) inputs.push(travelValue("parking_rm", parking, "Input pengguna", "RM"));
  } else if (fare !== null) {
    inputs.push(travelValue("transit_fare_rm", fare, "Input pengguna", "RM"));
  }
  if (fishPrice !== null) inputs.push(travelValue("fish_price_rm_per_kg", fishPrice, "Input pengguna"));
  if (qty !== null) inputs.push(travelValue("qty_kg", qty, "Input pengguna"));

  const components: TravelValueOut[] =
    mode === "kereta"
      ? [
          travelValue("fuel_litres", litres, "Anggaran perjalanan", "l"),
          travelValue("fuel_cost", fuelCost, "Anggaran perjalanan", "RM"),
          travelValue("toll_rm", toll > 0 ? toll * multiplier : 0, "Anggaran perjalanan", "RM"),
          travelValue("parking_rm", parking, "Anggaran perjalanan", "RM"),
        ]
      : [travelValue("transit_fare_rm", travelTotal, "Anggaran perjalanan", "RM")];

  return {
    mode,
    fuel_type: input.fuel_type ?? "RON95",
    return_trip: returnTrip,
    estimated: travelTotal !== null,
    message: travelTotal === null ? TRAVEL_NOT_ESTIMATED : null,
    inputs,
    components,
    travel_total: travelValue("travel_total", travelTotal, "Anggaran perjalanan", "RM"),
    fish_cost: travelValue("fish_cost", fishCost, "Input pengguna", "RM"),
    grand_total: travelValue("grand_total", grandTotal, "Anggaran perjalanan", "RM"),
    effective_rm_per_kg: travelValue("effective_rm_per_kg", effective, "Anggaran perjalanan", "RM/kg"),
    fare_source: null,
    fare_source_detail: null,
    notes: [
      "Kos perjalanan dipaparkan berasingan daripada kos ikan.",
      "Kos perjalanan tidak digunakan dalam ramalan harga.",
    ],
    demo: false,
  };
}


// --- /alerts (dashboard section B) ---------------------------------------------------------------

/**
 * Dashboard supply alerts, mirroring the shape the real endpoint returns (an Open-Meteo rain day
 * plus the next public holiday). These two entries are placeholders for design review only: the
 * numbers are not readings, and the source line says so. Neither claims a price or a saving.
 */
const ALERTS: AlertsOut = {
  items: [
    {
      id: "alert-preview-rain-kl",
      kind: "weather",
      title: "Hujan lebat dijangka",
      body: "Ramalan Open-Meteo menunjukkan 15.4 mm hujan terkumpul. HargaIkan menandakan hari pada 10 mm atau lebih.",
      source: "Preview placeholder",
      valid_from: "2026-10-29",
      valid_to: "2026-10-29",
      demo: false,
    },
    {
      id: "alert-preview-festival-deepavali",
      kind: "festivity",
      title: "Deepavali",
      body: "Perayaan ini 10 hari dari sekarang. HargaIkan menyenaraikannya daripada kalendar cuti umum, bukan ramalan harga.",
      source: "Preview placeholder",
      valid_from: "2026-11-08",
      valid_to: "2026-11-08",
      demo: false,
    },
  ],
  notice: null,
  demo: false,
};


// --- Public API responses -----------------------------------------------------------------------

const speciesList: SpeciesListOut = {
  count: SPECIES_SEEDS.length,
  items: SPECIES_SEEDS.map(toSpecies),
  demo: false,
};

const locationList: LocationListOut = { count: LOCATIONS.length, items: LOCATIONS };

/**
 * Hardcoded response for a public API path, or undefined to fall through to the real request.
 * Paths are the ones in src/api/client.ts, without the /api/v1 prefix.
 */
export function previewResponse(path: string, query?: PreviewQuery, body?: unknown): unknown {
  switch (path) {
    case "/health":
      return health;
    case "/species":
      return speciesList;
    case "/locations":
      return locationList;
    case "/overview":
      return overview();
    case "/alerts":
      return ALERTS;
    case "/search":
      return search(String(query?.q ?? ""));
    case "/prices/reference":
      return reference(query);
    case "/recommendations":
      return recommendations(query);
    case "/forecast":
      return forecast(query);
    case "/travel/estimate":
      return travel(body);
    default:
      return undefined;
  }
}


// End of the temporary design-preview data.
