import { lazy, Suspense } from "react";
import type { ReferenceOut } from "../api/types";
import { period, rmPerKg } from "../format";
import { translateApiText, useLanguage } from "../i18n";
import { Labels, Notice } from "./Labels";
import { Verdict } from "./Verdict";

const PriceChart = lazy(() => import("./PriceChart"));

export function ReferenceCard({
  data,
  showChart = true,
  headingLevel = 2,
}: {
  data: ReferenceOut;
  showChart?: boolean;
  headingLevel?: 2 | 3;
}) {
  const { lang, t } = useLanguage();
  const { band } = data;
  const H = headingLevel === 2 ? "h2" : "h3";
  if (data.demo || band?.demo || data.chart?.demo) {
    return (
      <p className="meta" role="status">
        {t.priceDataUnavailable}
      </p>
    );
  }
  return (
    <section className="card reference-card" aria-labelledby={`ref-${data.species.id}`}>
      <H id={`ref-${data.species.id}`}>
        {t.referenceCard.headingPrefix} {data.species.name_ms}
      </H>
      {data.message && <Notice tone={data.available ? "info" : "warning"}>{data.message}</Notice>}
      {band && (
        <>
          <p className="meta">
            {t.referenceCard.referenceLocation} <strong>{band.location.name}</strong>
            {data.is_fallback && ` (${t.referenceCard.requestedPrefix} ${data.requested_location.name})`}
          </p>
          <div className="labels-row">
            <Labels source={band.source_label} />
          </div>
          <dl className="tiles band">
            <div className="tile tile-hero">
              <dt>{t.referenceCard.medianPrice}</dt>
              <dd className="hero-number num">{rmPerKg(band.median)}</dd>
            </div>
            <div className="tile">
              <dt>{t.referenceCard.p25}</dt>
              <dd className="num">{rmPerKg(band.p25)}</dd>
            </div>
            <div className="tile">
              <dt>{t.referenceCard.p75}</dt>
              <dd className="num">{rmPerKg(band.p75)}</dd>
            </div>
          </dl>
          <dl className="tiles facts">
            <div className="tile">
              <dt>{t.referenceCard.records}</dt>
              <dd className="num">{band.record_count}</dd>
            </div>
            <div className="tile">
              <dt>{t.referenceCard.confidence}</dt>
              <dd>{t.confidenceLabels[band.confidence_level] ?? band.confidence_level}</dd>
            </div>
            <div className="tile">
              <dt>{t.referenceCard.period}</dt>
              <dd>{period(band.period_start, band.period_end, lang)}</dd>
            </div>
            {band.grade && (
              <div className="tile">
                <dt>{t.referenceCard.grade}</dt>
                <dd>{band.grade}</dd>
              </div>
            )}
          </dl>
        </>
      )}
      {data.quote && (
        <p className="quote">
          {t.referenceCard.sellerPrice} <strong className="num">{rmPerKg(data.quote.value)}</strong>{" "}
          <Labels source={data.quote.source_label} />
        </p>
      )}
      {data.quote_error && <Notice tone="error">{data.quote_error}</Notice>}
      {data.verdict && <Verdict verdict={data.verdict} />}
      {showChart && data.chart && data.chart.points.length > 0 && (
        <Suspense fallback={<p>{t.loading}</p>}>
          <PriceChart chart={data.chart} />
        </Suspense>
      )}
      {data.chart_notice && <Notice>{translateApiText(data.chart_notice, lang)}</Notice>}
    </section>
  );
}
