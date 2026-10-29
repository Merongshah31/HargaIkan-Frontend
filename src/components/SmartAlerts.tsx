import type { AlertOut, AlertsOut } from "../api/types";
import { date } from "../format";
import { translateApiText, useLanguage } from "../i18n";
import { WARNING_ICON, type AppMessages, type Language } from "../messages";
import { Notice } from "./Labels";

/**
 * Dashboard section B. The backend supplies both sources: the Open-Meteo forecast reduced by
 * HargaIkan's own thresholds, and the maintained public-holiday calendar. This renders whatever the
 * API returns and nothing more — an alert list, a "could not be read" notice, or an empty state. It
 * never derives a warning from a price pattern.
 */
/** The API may join several notices into one string, so translate it sentence by sentence. */
function translateNotice(notice: string, lang: Language): string {
  return notice
    .split(/(?<=\.)\s+/)
    .map((sentence) => translateApiText(sentence, lang))
    .join(" ");
}

/** A festival is a single day ("on"); a weather alert covers the forecast day ("until"). */
function dateLine(item: AlertOut, lang: Language, t: AppMessages): string {
  if (item.kind === "festivity" && item.valid_from) return ` · ${t.alerts.onDate} ${date(item.valid_from, lang)}`;
  return item.valid_to ? ` · ${t.alerts.untilDate} ${date(item.valid_to, lang)}` : "";
}

export function SmartAlerts({ data }: { data: AlertsOut }) {
  const { lang, t } = useLanguage();
  const items = data.items.filter((item) => !item.demo);
  return (
    <section className="card smart-alerts" aria-labelledby="alerts-heading">
      <div className="section-heading-row">
        <div>
          <p className="market-kicker">{t.alerts.kicker}</p>
          <h2 id="alerts-heading">{t.alerts.title}</h2>
        </div>
      </div>
      <p className="meta">{t.alerts.lead}</p>
      {items.length > 0 && (
        <ul className="alert-list">
          {items.map((item) => (
            <li className="alert-row" key={item.id}>
              <span className="alert-icon" aria-hidden="true">
                {WARNING_ICON}
              </span>
              <div className="alert-body">
                <p className="alert-title">
                  <span className="alert-kind">{t.alerts.kindLabels[item.kind]}</span>
                  {translateApiText(item.title, lang)}
                </p>
                <p>{translateApiText(item.body, lang)}</p>
                <p className="meta">
                  {translateApiText(item.source, lang)}
                  {dateLine(item, lang, t)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {items.length === 0 && !data.notice && (
        <div className="empty">
          <p>{t.alerts.empty}</p>
        </div>
      )}
      {data.notice && <Notice tone="warning">{translateNotice(data.notice, lang)}</Notice>}
    </section>
  );
}
