import { Link } from "react-router-dom";
import type { BandOut, RecommendationItemOut, SpeciesRef } from "../api/types";
import { rmPerKg } from "../format";
import { useLanguage } from "../i18n";
import { SourceBadge } from "./Labels";

export type PriceLevel = "high" | "low" | "typical";

/** Position inside the published band. Never a guess: at or above P75 is high, at or below P25 low. */
export function priceLevel(value: number, band: Pick<BandOut, "p25" | "p75">): PriceLevel {
  if (band.p75 > 0 && value >= band.p75) return "high";
  if (band.p25 > 0 && value <= band.p25) return "low";
  return "typical";
}

/** One favourite that is priced high, with the cheaper verified similar fish to try instead. */
export interface SwapSuggestion {
  favourite: SpeciesRef;
  favouritePrice: number;
  level: PriceLevel;
  locationName: string;
  swap: RecommendationItemOut;
}

/**
 * Dashboard section C. Built only from published data: the favourite's reference band decides
 * whether it is expensive, and the recommendation list supplies a verified cheaper species. When the
 * favourite is not expensive there is nothing to suggest, so the section says so.
 */
export function SmartSwaps({ items, hasPreferences }: { items: SwapSuggestion[]; hasPreferences: boolean }) {
  const { t } = useLanguage();
  return (
    <section className="card smart-swaps" aria-labelledby="swaps-heading">
      <div className="section-heading-row">
        <div>
          <p className="market-kicker">{t.swaps.kicker}</p>
          <h2 id="swaps-heading">{t.swaps.title}</h2>
        </div>
      </div>
      <p className="meta">{t.swaps.lead}</p>

      {!hasPreferences && (
        <div className="empty">
          <p>{t.swaps.noPreferences}</p>
        </div>
      )}
      {hasPreferences && items.length === 0 && (
        <div className="empty">
          <p>{t.swaps.empty}</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="swap-list">
          {items.map((item) => (
            <li className="swap-row" key={item.favourite.id}>
              <p className="swap-lead">
                {t.swaps.usuallyBuyPrefix} <strong>{item.favourite.name_ms}</strong>
                {t.swaps.butItIsAt} <strong className="num">{rmPerKg(item.favouritePrice)}</strong>{" "}
                <span className={`swap-level swap-level-${item.level}`}>
                  ({t.priceLevels[item.level]})
                </span>{" "}
                {t.swaps.inLocationPrefix} {item.locationName}.
              </p>
              <p className="swap-suggestion">
                {t.swaps.tryPrefix} <strong>{item.swap.species.name_ms}</strong> {t.swaps.atWord}{" "}
                <strong className="num">{rmPerKg(item.swap.median)}</strong>
                <span className="swap-saving">
                  {" · "}
                  <span className="swap-saving-label">{t.swaps.saving}</span>{" "}
                  <strong className="num">{rmPerKg(item.swap.savings_rm_per_kg)}</strong>
                </span>
              </p>
              <div className="labels-row">
                <SourceBadge label={item.swap.source_label} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="more-link">
        <Link className="text-link" to="/cari">
          {t.swaps.linkLabel}
        </Link>
      </p>
    </section>
  );
}
