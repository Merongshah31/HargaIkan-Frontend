import { useId } from "react";
import type { RecommendationsOut } from "../api/types";
import { period, rm, rmPerKg } from "../format";
import { translateApiText, useLanguage } from "../i18n";
import { WARNING_ICON } from "../messages";
import { ErrorMessages, Labels, Notice } from "./Labels";

interface Props {
  data: RecommendationsOut | null;
  error?: string[] | null;
  headingLevel?: 2 | 3;
}

export function Recommendations({ data, error, headingLevel = 2 }: Props) {
  const { lang, t } = useLanguage();
  const H = headingLevel === 2 ? "h2" : "h3";
  const headingId = useId();
  const items = data?.items.filter((item) => !item.demo) ?? [];
  return (
    <section className="card" aria-labelledby={headingId}>
      <H id={headingId}>{t.recommendationsCard.title}</H>
      <ErrorMessages messages={error} />
      {data?.notice && <Notice tone="warning">{data.notice}</Notice>}
      {data?.personalised && <p className="meta">{t.recommendationsCard.personalisedNote}</p>}
      {data?.allergy_caution && <Notice tone="warning">{data.allergy_caution}</Notice>}
      {data && items.length === 0 && (
        <div className="empty">
          <p>
            <strong>
              {data.items.length
                ? t.priceDataUnavailable
                : translateApiText(data.empty_message ?? t.recommendationsCard.noRecommendationsFallback, lang)}
            </strong>
          </p>
          {!data.items.length && data.empty_reason && <p>{translateApiText(data.empty_reason, lang)}</p>}
        </div>
      )}
      {items.length > 0 && (
        <ul className="rec-list">
          {items.map((it) => (
            <li key={it.species.id} className="rec-item">
              <div className="rec-head">
                <h4 className="rec-name">{it.species.name_ms}</h4>
                <p className="rec-saving">
                  <span className="rec-saving-label">{t.recommendationsCard.savingLabel}</span>{" "}
                  <strong className="rec-saving-value num">{rm(it.savings_rm_per_kg)}/kg</strong>
                </p>
              </div>
              <p className="rec-reason">{translateApiText(it.reason, lang)}</p>
              <div className="labels-row">
                <Labels source={it.source_label} />
              </div>
              <dl className="rec-facts">
                <div>
                  <dt>{t.recommendationsCard.median}</dt>
                  <dd className="num">{rmPerKg(it.median)}</dd>
                </div>
                <div>
                  <dt>{t.recommendationsCard.bandRange}</dt>
                  <dd className="num">
                    {rmPerKg(it.p25)} – {rmPerKg(it.p75)}
                  </dd>
                </div>
                <div>
                  <dt>{t.recommendationsCard.records}</dt>
                  <dd className="num">{it.record_count}</dd>
                </div>
                <div>
                  <dt>{t.recommendationsCard.confidence}</dt>
                  <dd>{t.confidenceLabels[it.confidence_level] ?? it.confidence_level}</dd>
                </div>
                <div>
                  <dt>{t.recommendationsCard.location}</dt>
                  <dd>{it.location_name}</dd>
                </div>
                <div>
                  <dt>{t.recommendationsCard.period}</dt>
                  <dd>{period(it.period_start, it.period_end, lang)}</dd>
                </div>
              </dl>
              {it.differences.length > 0 && (
                <>
                  <p className="meta">{t.recommendationsCard.differences}</p>
                  <ul className="diffs">
                    {it.differences.map((d) => (
                      <li key={d}>{translateApiText(d, lang)}</li>
                    ))}
                  </ul>
                </>
              )}
              {it.over_budget && (
                <p className="over-budget">
                  <span aria-hidden="true">{WARNING_ICON}</span>{" "}
                  {translateApiText(it.over_budget_label ?? t.recommendationsCard.overBudgetFallback, lang)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      {data && (
        <p className="meta" data-testid="disclaimer">
          {translateApiText(data.disclaimer, lang) || t.recommendationDisclaimer}
        </p>
      )}
    </section>
  );
}
