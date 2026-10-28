import type { SuggestionOut, WeeklyPointOut } from "../api/types";
import { rmPerKg } from "../format";
import { HISTORICAL_REFERENCE, LATEST_REFERENCES, MARKET_WATCH } from "../messages";

export interface MarketWatchItem { suggestion: SuggestionOut; points: WeeklyPointOut[]; }
function Sparkline({ points, name }: { points: WeeklyPointOut[]; name: string }) {
  const values = points.map((p) => p.median);
  const min = Math.min(...values); const span = Math.max(...values) - min || 1;
  const path = values.map((value, index) => `${index ? "L" : "M"}${(index / (values.length - 1)) * 100} ${30 - ((value - min) / span) * 28}`).join(" ");
  return <svg className="market-sparkline" viewBox="0 0 100 32" role="img" aria-label={`${points.length}-point historical trend for ${name}`}><path d={path} /></svg>;
}
export function MarketWatchList({ items }: { items: MarketWatchItem[] }) {
  return <section className="market-watch" aria-labelledby="market-watch-heading"><div className="market-watch-heading"><div><p className="market-kicker"><span aria-hidden="true">▼</span> {LATEST_REFERENCES}</p><h2 id="market-watch-heading">{MARKET_WATCH}</h2></div></div><ul className="market-list">{items.map(({ suggestion, points }) => <li className="market-row" key={suggestion.species.id}><span className="fish-mark" aria-hidden="true">🐟</span><div className="market-name"><strong>{suggestion.species.name_ms}</strong><span className="num">{rmPerKg(suggestion.median)}</span></div><div className="market-trend">{points.length >= 2 ? <Sparkline points={points} name={suggestion.species.name_ms} /> : <span>{HISTORICAL_REFERENCE}</span>}</div></li>)}</ul></section>;
}
