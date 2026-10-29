import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { api, errorMessages } from "../api/client";
import type { RecommendationsOut, ReferenceOut, SearchOut, SpeciesRef } from "../api/types";
import { ErrorMessages, Notice } from "../components/Labels";
import { LocationSelect } from "../components/Pickers";
import { Recommendations } from "../components/Recommendations";
import { ReferenceCard } from "../components/ReferenceCard";
import { PageHeader } from "../components/PageHeader";
import { translateApiText, useLanguage } from "../i18n";
import { useCatalog } from "../session/CatalogProvider";

const LocationMap = lazy(() => import("../components/LocationMap"));

export function CariIkan() {
  const catalog = useCatalog();
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState<SearchOut | null>(null);
  const [searchError, setSearchError] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<SpeciesRef | null>(null);
  const [locationId, setLocationId] = useState("");
  const [grade, setGrade] = useState("");
  const [quoteInput, setQuoteInput] = useState("");
  const [quote, setQuote] = useState<string | null>(null);
  const [reference, setReference] = useState<ReferenceOut | null>(null);
  const [referenceError, setReferenceError] = useState<string[] | null>(null);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationsOut | null>(null);
  const [recommendationError, setRecommendationError] = useState<string[] | null>(null);

  useEffect(() => {
    if (!locationId && catalog.defaultLocationId) setLocationId(catalog.defaultLocationId);
  }, [catalog.defaultLocationId, locationId]);

  useEffect(() => {
    if (!selected || !locationId) return;
    let alive = true;
    setReferenceLoading(true);
    setReferenceError(null);

    void api
      .reference({ species_id: selected.id, location_id: locationId, grade: grade || null, quote })
      .then((result) => {
        if (alive) setReference(result);
      })
      .catch((error: unknown) => {
        if (alive) {
          setReference(null);
          setReferenceError(errorMessages(error));
        }
      })
      .finally(() => {
        if (alive) setReferenceLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selected, locationId, grade, quote]);

  useEffect(() => {
    if (!selected || !locationId) return;
    let alive = true;
    setRecommendationError(null);

    void api
      .recommendations({ species_id: selected.id, location_id: locationId })
      .then((result) => {
        if (alive) setRecommendations(result);
      })
      .catch((error: unknown) => {
        if (alive) {
          setRecommendations(null);
          setRecommendationError(errorMessages(error));
        }
      });

    return () => {
      alive = false;
    };
  }, [selected, locationId]);

  const choose = (item: SpeciesRef) => {
    setSelected(item);
    setGrade("");
    setReference(null);
    setRecommendations(null);
  };

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearching(true);
    setSearchError(null);

    try {
      const result = await api.search(query.trim());
      setSearch(result);
      if (result.status === "confident" && result.matches[0]) {
        choose({ id: result.matches[0].species_id, name_ms: result.matches[0].name_ms });
      }
    } catch (error) {
      setSearch(null);
      setSearchError(errorMessages(error));
    } finally {
      setSearching(false);
    }
  };

  const hasPins = catalog.locations.some((location) => location.has_coordinates);

  if (catalog.syntheticCatalog) {
    return (
      <>
        <PageHeader title={t.pages.cari.title} lead={t.pages.cari.lead} />
        <Notice live>{t.priceDataUnavailable}</Notice>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.pages.cari.title} lead={t.pages.cari.lead} />
      <form className="card form search-form" onSubmit={onSearch} role="search">
        <div className="field">
          <label htmlFor="search-q">{t.fishFinder.fishName}</label>
          <div className="inline-form">
            <input
              id="search-q"
              type="search"
              value={query}
              maxLength={200}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.fishFinder.searchPlaceholder}
            />
            <button type="submit" disabled={searching}>
              {searching ? t.fishFinder.searching : t.fishFinder.searchAction}
            </button>
          </div>
        </div>
      </form>

      <div aria-live="polite">
        <ErrorMessages messages={searchError} />
        {search?.notice && (
          <Notice tone={search.status === "none" || search.status === "empty_query" ? "warning" : "info"}>
            {search.notice}
          </Notice>
        )}
        {search?.status === "candidates" && (
          <section className="card" aria-labelledby="candidate-heading">
            <h2 id="candidate-heading">{translateApiText(search.confirm_prompt, lang)}</h2>
            <ul className="choice-list">
              {search.matches.map((match) => (
                <li key={match.species_id}>
                  <button
                    type="button"
                    className="secondary"
                    aria-pressed={selected?.id === match.species_id}
                    onClick={() => choose({ id: match.species_id, name_ms: match.name_ms })}
                  >
                    {match.name_ms}
                    {match.matched_alias !== match.name_ms ? ` (${match.matched_alias})` : ""}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {selected && (
          <p className="selected">
            {t.fishFinder.selectedFish} <strong>{selected.name_ms}</strong>
          </p>
        )}
      </div>

      <section className="card form" aria-labelledby="finder-options-heading">
        <h2 id="finder-options-heading">{t.fishFinder.optionsTitle}</h2>
        <LocationSelect id="cari-location" value={locationId} onChange={setLocationId} />
        {hasPins ? (
          <Suspense fallback={<p>{t.loading}</p>}>
            <LocationMap locations={catalog.locations} selectedId={locationId} onSelect={setLocationId} />
          </Suspense>
        ) : (
          !catalog.loading && <p className="meta">{t.fishFinder.noMapLocations}</p>
        )}
        {reference && reference.grades.length > 0 && (
          <div className="field">
            <label htmlFor="cari-grade">{t.fishFinder.gradeLabel}</label>
            <select id="cari-grade" value={grade} onChange={(event) => setGrade(event.target.value)}>
              <option value="">{t.fishFinder.allGrades}</option>
              {reference.grades.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setQuote(quoteInput.trim() || null);
          }}
          className="inline-form"
        >
          <div className="field">
            <label htmlFor="cari-quote">{t.fishFinder.sellerPrice}</label>
            <input
              id="cari-quote"
              inputMode="decimal"
              maxLength={32}
              value={quoteInput}
              onChange={(event) => setQuoteInput(event.target.value)}
              placeholder={t.fishFinder.sellerPricePlaceholder}
            />
          </div>
          <button type="submit" disabled={!selected}>
            {t.fishFinder.checkPrice}
          </button>
        </form>
      </section>

      <div aria-live="polite" aria-busy={referenceLoading}>
        {referenceLoading && <p>{t.loading}</p>}
        <ErrorMessages messages={referenceError} />
        {reference && <ReferenceCard data={reference} />}
      </div>
      {selected && (recommendations || recommendationError) && (
        <div aria-live="polite">
          <Recommendations data={recommendations} error={recommendationError} />
        </div>
      )}
    </>
  );
}
