import type { OverviewOut } from "../api/types";
import { date } from "../format";
import { translateApiText, useLanguage } from "../i18n";
import type { MarketWatchItem } from "./MarketWatchList";
import { MarketWatchList } from "./MarketWatchList";
import { Notice } from "./Labels";

export function Overview({ data, marketItems }: { data: OverviewOut; marketItems: MarketWatchItem[] }) {
  const { lang, t } = useLanguage();
  if (data.demo) return <p className="meta" role="status">{t.priceDataUnavailable}</p>;
  return (
    <section className="overview" aria-label={t.dashboard.overviewAriaLabel}>
      {data.notice && <Notice tone="warning">{data.notice}</Notice>}
      <dl className="overview-facts">
        <div>
          <dt>{t.dashboard.speciesCountLabel}</dt>
          <dd className="num">{data.species_count ?? "—"}</dd>
        </div>
        <div>
          <dt>{t.dashboard.premiseCountLabel}</dt>
          <dd className="num">{data.premise_count ?? "—"}</dd>
        </div>
        <div>
          <dt>{t.dashboard.latestPeriodLabel}</dt>
          <dd>{date(data.latest_period, lang)}</dd>
        </div>
      </dl>
      {data.suggestions_notice && <Notice>{data.suggestions_notice}</Notice>}
      {marketItems.length > 0 ? (
        <MarketWatchList items={marketItems} />
      ) : (
        <p className="meta">{translateApiText(data.suggestions_title, lang)}</p>
      )}
    </section>
  );
}
