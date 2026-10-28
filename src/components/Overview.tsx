import type { OverviewOut } from "../api/types";
import { date } from "../format";
import { translateApiText } from "../i18n";
import type { MarketWatchItem } from "./MarketWatchList";
import { MarketWatchList } from "./MarketWatchList";
import { Notice } from "./Labels";
export function Overview({ data, marketItems }: { data: OverviewOut; marketItems: MarketWatchItem[] }) {
  return <section className="overview" aria-label="Market overview">{data.notice && <Notice tone="warning">{data.notice}</Notice>}<dl className="overview-facts"><div><dt>Fish species</dt><dd className="num">{data.species_count ?? "—"}</dd></div><div><dt>Markets / premises</dt><dd className="num">{data.premise_count ?? "—"}</dd></div><div><dt>Latest data period</dt><dd>{date(data.latest_period)}</dd></div></dl>{data.suggestions_notice && <Notice>{data.suggestions_notice}</Notice>}{marketItems.length > 0 ? <MarketWatchList items={marketItems} /> : <p className="meta">{translateApiText(data.suggestions_title)}</p>}</section>;
}
