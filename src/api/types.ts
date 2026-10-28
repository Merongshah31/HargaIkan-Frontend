// Typed models mirroring the public FastAPI API. Dates are ISO strings.

export type SourceLabelText =
  | "Harga sejarah"
  | "Input pengguna"
  | "Anggaran model"
  | "Anggaran perjalanan"
  | "Jadual tambang";

export type BackendKind = "memory" | "supabase";
export type LocationLevel = "pasar" | "premis" | "kawasan" | "negeri" | "nasional";
export type ConfidenceLevel = "rendah" | "sederhana" | "tinggi";

export interface ErrorDetail {
  code: string;
  messages: string[];
  fields?: Record<string, string> | null;
}

export interface ErrorResponse {
  detail: ErrorDetail;
}

export interface HealthOut {
  status: "ok";
  backend: BackendKind;
  demo: boolean;
  version: string;
}

export interface LegendItemOut {
  label: string;
  icon: string;
  description: string;
}

export interface AliasOut {
  alias: string;
  language: string;
}

export interface FishProfileOut {
  texture: string;
  taste: string;
  bone_level: string;
  cooking_methods: string[];
  allergen_groups: string[];
  notes: string | null;
}

export interface SpeciesOut {
  id: string;
  code: string;
  name_ms: string;
  name_en: string | null;
  allergen_groups: string[];
  aliases: AliasOut[];
  profile: FishProfileOut | null;
}

export interface SpeciesListOut {
  count: number;
  items: SpeciesOut[];
  demo: boolean;
}

export interface LocationOut {
  id: string;
  name: string;
  level: LocationLevel;
  parent_id: string | null;
  lat: number | null;
  lng: number | null;
  has_coordinates: boolean;
}

export interface LocationListOut {
  count: number;
  items: LocationOut[];
}

export interface LocationRef {
  id: string;
  name: string;
  level: string;
}

export interface SpeciesRef {
  id: string;
  name_ms: string;
}

export interface SearchMatchOut {
  species_id: string;
  name_ms: string;
  matched_alias: string;
  score: number;
}

export interface SearchOut {
  query: string;
  status: "confident" | "candidates" | "none" | "empty_query";
  matches: SearchMatchOut[];
  backend: "exact" | "pinecone" | "fuzzy";
  degraded: boolean;
  notice: string | null;
  confirm_prompt: string | null;
}

export interface BandOut {
  p25: number;
  median: number;
  p75: number;
  record_count: number;
  confidence_level: ConfidenceLevel;
  period_start: string;
  period_end: string;
  grade: string | null;
  band_source: string;
  location: LocationRef;
  source_label: "Harga sejarah";
  demo: boolean;
  demo_label: string | null;
}

export interface QuoteOut {
  value: number;
  source_label: "Input pengguna";
  demo: boolean;
}

export type VerdictKind = "below" | "within" | "above" | "no_data";

export interface VerdictOut {
  kind: VerdictKind;
  text: string;
  icon: string;
}

export interface WeeklyPointOut {
  week_start: string;
  median: number;
  record_count: number;
}

export interface ChartOut {
  location: LocationRef;
  points: WeeklyPointOut[];
  band_p25: number;
  band_p75: number;
  source_label: "Harga sejarah";
  demo: boolean;
  quote: QuoteOut | null;
}

export interface ReferenceOut {
  species: SpeciesRef;
  requested_location: LocationRef;
  used_location: LocationRef | null;
  available: boolean;
  is_fallback: boolean;
  message: string | null;
  band: BandOut | null;
  grade: string | null;
  grades: string[];
  quote: QuoteOut | null;
  quote_error: string | null;
  verdict: VerdictOut | null;
  chart: ChartOut | null;
  chart_notice: string | null;
  demo: boolean;
}

export interface RecommendationItemOut {
  species: SpeciesRef;
  reason: string;
  differences: string[];
  p25: number;
  median: number;
  p75: number;
  savings_rm_per_kg: number;
  record_count: number;
  confidence_level: string;
  location_name: string;
  period_start: string;
  period_end: string;
  similarity_score: number;
  over_budget: boolean;
  over_budget_label: string | null;
  source_label: "Harga sejarah";
  demo: boolean;
  demo_label: string | null;
}

export interface RecommendationsOut {
  species: SpeciesRef;
  location: LocationRef;
  items: RecommendationItemOut[];
  empty_message: string | null;
  empty_reason: string | null;
  original_allergy_match: boolean;
  allergy_caution: string | null;
  disclaimer: string;
  personalised: boolean;
  notice: string | null;
}

export interface PredictionOut {
  predicted_median: number;
  p10: number | null;
  p90: number | null;
  method: string;
  model_version: string;
  mae: number;
  target_start: string;
  target_end: string;
  last_data_date: string;
  is_baseline: boolean;
  location: LocationRef;
  source_label: "Anggaran model";
  demo: boolean;
}

export interface ForecastOut {
  species: SpeciesRef;
  location: LocationRef;
  available: boolean;
  message: string | null;
  prediction: PredictionOut | null;
  p75_message: string | null;
  early_buy_message: string | null;
  quote: QuoteOut | null;
  quote_error: string | null;
}

/** Money / quantity input: a JSON number or short numeric string. */
export type NumberInput = number | string;

export interface TravelIn {
  mode: "kereta" | "pengangkutan_awam";
  distance_km?: NumberInput | null;
  fuel_efficiency_km_per_l?: NumberInput | null;
  fuel_type?: "RON95" | "RON97";
  fuel_price_rm_per_l?: NumberInput | null;
  toll_rm?: NumberInput | null;
  parking_rm?: NumberInput | null;
  transit_fare_rm?: NumberInput | null;
  transit_mode?: "mrt" | "lrt" | "monorel" | "bas" | null;
  origin?: string | null;
  destination?: string | null;
  return_trip?: boolean;
  fish_price_rm_per_kg?: NumberInput | null;
  qty_kg?: NumberInput | null;
}

export interface TravelValueOut {
  key: string;
  name: string;
  value: string | null;
  display: string;
  unit: string;
  source_label: SourceLabelText;
  display_label: string;
  demo: boolean;
  note: string | null;
}

export interface TravelOut {
  mode: string;
  fuel_type: string;
  return_trip: boolean;
  estimated: boolean;
  message: string | null;
  inputs: TravelValueOut[];
  components: TravelValueOut[];
  travel_total: TravelValueOut;
  fish_cost: TravelValueOut;
  grand_total: TravelValueOut;
  effective_rm_per_kg: TravelValueOut;
  fare_source: SourceLabelText | null;
  fare_source_detail: string | null;
  notes: string[];
  demo: boolean;
}

export interface SuggestionOut {
  species: SpeciesRef;
  location: LocationRef;
  p25: number;
  median: number;
  p75: number;
  record_count: number;
  confidence_level: string;
  period_start: string;
  period_end: string;
  source_label: "Harga sejarah";
  demo: boolean;
  demo_label: string | null;
}

export interface OverviewOut {
  species_count: number | null;
  premise_count: number | null;
  latest_period: string | null;
  demo: boolean;
  demo_label: string | null;
  notice: string | null;
  legend: LegendItemOut[];
  suggestions_title: string;
  suggestions: SuggestionOut[];
  suggestions_notice: string | null;
}
