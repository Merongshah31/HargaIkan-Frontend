import type { SuggestionOut, WeeklyPointOut } from "../api/types";
import { rmPerKg } from "../format";
import { useLanguage } from "../i18n";

export interface MarketWatchItem {
  suggestion: SuggestionOut;
  points: WeeklyPointOut[];
}

export type TrendDirection = "up" | "down" | "flat";
export interface Trend {
  direction: TrendDirection;
  percent: number;
}

/** Price above the published P75 band: the one case worth a warning icon. */
export function isHighPrice(price: number | null, p75: number): boolean {
  return price !== null && Number.isFinite(price) && p75 > 0 && price > p75;
}

/**
 * Last published week against the week before it. Two points are the minimum: with fewer there is
 * no movement to report, so the row falls back to the historical-reference label.
 */
export function trendFor(points: WeeklyPointOut[]): Trend | null {
  if (points.length < 2) return null;
  const previous = points[points.length - 2].median;
  const latest = points[points.length - 1].median;
  if (!Number.isFinite(previous) || !Number.isFinite(latest) || previous <= 0) return null;
  const change = ((latest - previous) / previous) * 100;
  if (Math.abs(change) < 0.05) return { direction: "flat", percent: 0 };
  return { direction: change > 0 ? "up" : "down", percent: Math.abs(change) };
}

const ARROWS: Record<TrendDirection, string> = { up: "▲", down: "▼", flat: "▬" };

function TrendCell({ trend }: { trend: Trend | null }) {
  const { t } = useLanguage();
  if (!trend) return <span className="market-trend-none">{t.historicalReference}</span>;
  const words: Record<TrendDirection, string> = {
    up: t.trendUp,
    down: t.trendDown,
    flat: t.trendFlat,
  };
  return (
    <span className={`market-trend-value market-trend-${trend.direction}`}>
      <span className="market-trend-line">
        <span className="market-arrow" aria-hidden="true">
          {ARROWS[trend.direction]}
        </span>
        <span className="num">{trend.percent === 0 ? "—" : `${trend.percent.toFixed(1)}%`}</span>
      </span>
      <span className="market-trend-words">{words[trend.direction]}</span>
    </span>
  );
}

export function MarketWatchList({ items }: { items: MarketWatchItem[] }) {
  const { t } = useLanguage();
  const published = items.filter(({ suggestion }) => !suggestion.demo);
  if (!published.length) return null;
  return (
    <section className="market-watch" aria-labelledby="market-watch-heading">
      <div className="market-watch-heading">
        <div>
          <p className="market-kicker">
            <span aria-hidden="true">▼</span> {t.latestReferences}
          </p>
          <h2 id="market-watch-heading">{t.marketWatch}</h2>
        </div>
      </div>
      <ul className="market-list">
        {published.map(({ suggestion, points }) => {
          const latest = points.length ? points[points.length - 1].median : null;
          const high = isHighPrice(latest, suggestion.p75);
          return (
            <li className="market-row" key={suggestion.species.id}>
              <span className="fish-mark" aria-hidden="true">
                🐟
              </span>
              <div className="market-name">
                <strong>
                  {suggestion.species.name_ms}
                  {high && (
                    <span className="market-flag" title={t.highPriceFlag}>
                      <span aria-hidden="true">{"⚠️"}</span>
                      <span className="sr-only">{t.highPriceFlag}</span>
                    </span>
                  )}
                </strong>
                <span className="num">{rmPerKg(suggestion.median)}</span>
              </div>
              <div className="market-trend">
                <TrendCell trend={trendFor(points)} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
