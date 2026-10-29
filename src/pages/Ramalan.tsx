import { useEffect, useMemo, useState } from "react";
import { api, errorMessages } from "../api/client";
import type { ModelSnapshotOut, SpeciesOut } from "../api/types";
import { ErrorMessages, SourceBadge } from "../components/Labels";
import { PageHeader } from "../components/PageHeader";
import { date, rmPerKg } from "../format";
import { readStoredLanguage, useLanguage } from "../i18n";
import { MESSAGES, type Language } from "../messages";
import { useCatalog } from "../session/CatalogProvider";

type SnapshotItem = ModelSnapshotOut["items"][number];

/** Colour step for a tile. `up` means the model estimate is above the published median. */
export type HeatLevel = "up3" | "up2" | "up1" | "flat" | "down1" | "down2" | "down3" | "none";

export interface ForecastTile {
  key: string;
  name: string;
  /** Model value in RM/kg, or null when the supplied model has no row for this fish. */
  estimate: number | null;
  /** Published median in the reference location, or null when no record covers this fish. */
  median: number | null;
  /** Percent above (+) or below (−) the median; null without a median. */
  change: number | null;
  level: HeatLevel;
  /** Relative tile width: the median price when it exists, otherwise the estimate. */
  weight: number;
  targetDate: string;
}

/** The model file names fish with the market's size notation: "IKAN KEMBUNG (ANTARA 8 HINGGA 12 EKOR SEKILOGRAM)". */
export function normalizeFishName(name: string): string {
  return name.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}

/** Percent difference between the estimate and the median. Null when there is nothing to compare. */
export function changePercent(estimate: number, median: number | null): number | null {
  if (median === null || !Number.isFinite(median) || median <= 0 || !Number.isFinite(estimate)) return null;
  return ((estimate - median) / median) * 100;
}

/** Three steps per direction, so a 1% and a 20% move do not share the same colour. */
export function heatLevel(change: number | null): HeatLevel {
  if (change === null || !Number.isFinite(change)) return "none";
  if (change === 0) return "flat";
  const size = Math.abs(change);
  const step = size < 3 ? 1 : size < 8 ? 2 : 3;
  return change > 0 ? (`up${step}` as HeatLevel) : (`down${step}` as HeatLevel);
}

/** "+7.4%", "−1.0%" or the short fallback; the arrow in the tile carries the same meaning. */
export function changeText(change: number | null, lang: Language = readStoredLanguage()): string {
  if (change === null) return MESSAGES[lang].forecast.noReference;
  const sign = change > 0 ? "+" : change < 0 ? "−" : "";
  return `${sign}${Math.abs(change).toFixed(1)}%`;
}

/**
 * One tile per fish. The catalogue is the list of fish we publish, so it drives the heat map; the
 * supplied model file is only the source of the values, matched on the name without its brackets.
 * When the catalogue is unavailable (demo data) the model's own rows are shown instead.
 */
export function forecastTiles(
  species: SpeciesOut[],
  snapshot: ModelSnapshotOut | null,
  medians: Record<string, number | null>,
): ForecastTile[] {
  const items = snapshot?.items ?? [];
  const byName = new Map<string, SnapshotItem>();
  for (const item of items) {
    const key = normalizeFishName(item.fish_name);
    if (!byName.has(key)) byName.set(key, item);
  }

  const make = (key: string, name: string, item: SnapshotItem | null, median: number | null): ForecastTile => {
    const estimate = item?.value ?? null;
    const change = estimate === null ? null : changePercent(estimate, median);
    return {
      key,
      name,
      estimate,
      median,
      change,
      level: heatLevel(change),
      weight: median ?? estimate ?? 1,
      targetDate: item?.target_date ?? "",
    };
  };

  const rows: ForecastTile[] = species.length
    ? species.map((sp) =>
        make(sp.id, sp.name_ms, byName.get(normalizeFishName(sp.name_ms)) ?? null, medians[sp.id] ?? null),
      )
    : items.map((item) => make(`snapshot:${item.item_code}`, item.fish_name, item, null));

  // Biggest rises first, biggest falls last; the fish without a comparison stay at the end.
  const order = (tile: ForecastTile) => (tile.change === null ? Number.NEGATIVE_INFINITY : tile.change);
  return rows.sort((left, right) => order(right) - order(left) || left.name.localeCompare(right.name));
}

/**
 * Published median for one fish, retried once: eleven of these leave together, and a cold API or a
 * momentary 503 should not leave a tile grey. Returns null when there is nothing published.
 */
async function medianFor(speciesId: string, locationId: string, retry = false): Promise<readonly [string, number | null]> {
  try {
    const result = await api.reference({ species_id: speciesId, location_id: locationId });
    return [speciesId, result.available ? result.band?.median ?? null : null] as const;
  } catch {
    if (retry) return [speciesId, null] as const;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return medianFor(speciesId, locationId, true);
  }
}

const ARROWS = { up: "▲", down: "▼", flat: "▬" } as const;

/** Hover text with the numbers a narrow tile cannot fit; the table below has them all too. */
export function tileTitle(tile: ForecastTile, lang: Language = readStoredLanguage()): string {
  const f = MESSAGES[lang].forecast;
  if (tile.estimate === null) return `${tile.name}: ${f.missing}`;
  const comparison =
    tile.median === null
      ? f.legendNone
      : `${changeText(tile.change, lang)} ${f.againstMedian} ${rmPerKg(tile.median)}`;
  return `${tile.name}: ${rmPerKg(tile.estimate)}, ${comparison}`;
}

function HeatCell({ tile }: { tile: ForecastTile }) {
  const { lang, t } = useLanguage();
  const direction = tile.change === null ? null : tile.change > 0 ? "up" : tile.change < 0 ? "down" : "flat";
  return (
    <li className={`heat-cell ${tile.level}`} style={{ flexGrow: Math.max(tile.weight, 1) }} title={tileTitle(tile, lang)}>
      <span className="heat-name">{tile.name}</span>
      <span className="heat-change">
        {tile.estimate === null
          ? t.forecast.missing
          : <>
              <span aria-hidden="true">{direction ? `${ARROWS[direction]} ` : ""}</span>
              {changeText(tile.change, lang)}
            </>}
      </span>
      <span className="heat-figures">{tile.estimate === null ? "—" : rmPerKg(tile.estimate)}</span>
    </li>
  );
}

export function Ramalan() {
  const { lang, t } = useLanguage();
  const catalog = useCatalog();
  const [snapshot, setSnapshot] = useState<ModelSnapshotOut | null>(null);
  const [snapshotError, setSnapshotError] = useState<string[] | null>(null);
  const [medians, setMedians] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .forecastSnapshot()
      .then((result) => { if (active) setSnapshot(result); })
      .catch((error) => { if (active) setSnapshotError(errorMessages(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // One reference per fish, so every tile compares with its own published median. A failing fish
  // keeps its estimate and simply has no colour, instead of hiding the whole heat map.
  useEffect(() => {
    const list = catalog.species;
    const locationId = catalog.defaultLocationId;
    if (!list.length || !locationId) return;
    let active = true;
    Promise.all(list.map((sp) => medianFor(sp.id, locationId)))
      .then((entries) => { if (active) setMedians(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, [catalog.species, catalog.defaultLocationId]);

  const tiles = useMemo(() => forecastTiles(catalog.species, snapshot, medians), [catalog.species, snapshot, medians]);
  const locationName =
    catalog.locations.find((location) => location.id === catalog.defaultLocationId)?.name ?? null;
  const targetDate = tiles.find((tile) => tile.targetDate)?.targetDate ?? "";

  return <>
    <PageHeader title={t.pages.ramalan.title} lead={t.pages.ramalan.lead} />
    <section className="card" aria-labelledby="forecast-title">
      <h2 id="forecast-title">{t.forecast.title}</h2>
      <p className="meta">
        {t.forecast.lead}
        {locationName ? ` ${t.forecast.compareTo} ${locationName}.` : ""}
        {targetDate ? ` ${t.forecast.targetDate} ${date(targetDate, lang)}.` : ""}
      </p>
      <ErrorMessages messages={snapshotError ?? catalog.speciesError} />
      {loading && <p role="status">{t.loading}</p>}

      {tiles.length > 0 && <>
        <ul className="heatmap">
          {tiles.map((tile) => <HeatCell key={tile.key} tile={tile} />)}
        </ul>
        <ul className="heat-legend">
          <li><span className="heat-swatch up2" aria-hidden="true" />{t.forecast.legendAbove}</li>
          <li><span className="heat-swatch down2" aria-hidden="true" />{t.forecast.legendBelow}</li>
          <li><span className="heat-swatch none" aria-hidden="true" />{t.forecast.legendNone}</li>
        </ul>
      </>}

      {tiles.length > 0 && <details className="heat-table">
        <summary>{t.forecast.tableToggle}</summary>
        <div className="table-wrap">
          <table className="table-stack">
            <caption className="sr-only">{t.forecast.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.forecast.fish}</th>
                <th scope="col">{t.forecast.estimate}</th>
                <th scope="col">{t.forecast.median}</th>
                <th scope="col">{t.forecast.change}</th>
                <th scope="col">{t.forecast.targetDate}</th>
                <th scope="col">{t.forecast.source}</th>
              </tr>
            </thead>
            <tbody>
              {tiles.map((tile) => (
                <tr key={tile.key}>
                  <th scope="row">{tile.name}</th>
                  <td className="num" data-label={t.forecast.estimate}>{tile.estimate === null ? "—" : rmPerKg(tile.estimate)}</td>
                  <td className="num" data-label={t.forecast.median}>{tile.median === null ? "—" : rmPerKg(tile.median)}</td>
                  <td className="num" data-label={t.forecast.change}>{changeText(tile.change, lang)}</td>
                  <td data-label={t.forecast.targetDate}>{tile.targetDate ? date(tile.targetDate, lang) : "—"}</td>
                  <td data-label={t.forecast.source}><SourceBadge label="Anggaran model" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>}

      {snapshot && <p className="meta">
        {t.forecast.fileNote}{" "}
        {t.forecast.modelStats(snapshot.model, snapshot.mae.toFixed(3), snapshot.baseline_mae.toFixed(3), snapshot.testing_records)}
      </p>}
    </section>
  </>;
}
