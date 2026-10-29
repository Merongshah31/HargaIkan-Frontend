import type { ForecastOut } from "../api/types";
import { date, period, rmPerKg } from "../format";
import { translateApiText, useLanguage } from "../i18n";
import { Labels, Notice } from "./Labels";

export function ForecastCard({ data, headingLevel = 2 }: { data: ForecastOut; headingLevel?: 2 | 3 }) {
  const { lang, t } = useLanguage();
  const H = headingLevel === 2 ? "h2" : "h3";
  const p = data.prediction;
  if (p?.demo) {
    return (
      <p className="meta" role="status">
        {t.priceDataUnavailable}
      </p>
    );
  }
  return (
    <section className="card" aria-labelledby={`fc-${data.species.id}`}>
      <H id={`fc-${data.species.id}`}>
        {t.forecastCard.headingPrefix} {data.species.name_ms} {t.forecastCard.inWord} {data.location.name}
      </H>
      {data.quote_error && <Notice tone="error">{data.quote_error}</Notice>}
      {!data.available || !p ? (
        <Notice>{data.message ?? t.forecastCard.unavailableFallback}</Notice>
      ) : (
        <>
          <div className="labels-row">
            <Labels source={p.source_label} />
          </div>
          <dl className="tiles facts">
            <div className="tile tile-hero">
              <dt>{t.forecastCard.estimatedMedian}</dt>
              <dd className="hero-number num">{rmPerKg(p.predicted_median)}</dd>
            </div>
            {p.p10 !== null && p.p90 !== null && (
              <div className="tile">
                <dt>{t.forecastCard.estimatedRange}</dt>
                <dd className="num">
                  {rmPerKg(p.p10)} – {rmPerKg(p.p90)}
                </dd>
              </div>
            )}
            <div className="tile">
              <dt>{t.forecastCard.forecastPeriod}</dt>
              <dd>{period(p.target_start, p.target_end, lang)}</dd>
            </div>
            <div className="tile">
              <dt>{t.forecastCard.latestData}</dt>
              <dd>{date(p.last_data_date, lang)}</dd>
            </div>
            <div className="tile">
              <dt>{t.forecastCard.modelLocation}</dt>
              <dd>{p.location.name}</dd>
            </div>
            <div className="tile">
              <dt>{t.forecastCard.modelVersion}</dt>
              <dd>
                {p.model_version}
                {p.method ? ` (${p.method})` : ""}
                {p.is_baseline ? t.forecastCard.baselineSuffix : ""}
              </dd>
            </div>
            <div className="tile">
              <dt>{t.forecastCard.mae}</dt>
              <dd className="num">{rmPerKg(p.mae)}</dd>
            </div>
          </dl>
          {data.quote && (
            <p className="quote">
              {t.forecastCard.sellerPrice} <strong className="num">{rmPerKg(data.quote.value)}</strong>{" "}
              <Labels source={data.quote.source_label} />
            </p>
          )}
          {data.p75_message && <Notice tone="warning">{data.p75_message}</Notice>}
          {data.early_buy_message && <Notice>{translateApiText(data.early_buy_message, lang)}</Notice>}
        </>
      )}
    </section>
  );
}
