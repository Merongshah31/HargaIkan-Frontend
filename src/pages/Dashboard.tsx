import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages } from "../api/client";
import type { OverviewOut } from "../api/types";
import { ErrorMessages } from "../components/Labels";
import type { MarketWatchItem } from "../components/MarketWatchList";
import { Overview } from "../components/Overview";
import { PageHeader } from "../components/PageHeader";
import { rmPerKg } from "../format";
import { useGuestPreferences } from "../guest/GuestPreferencesProvider";
import { DASHBOARD, PAGES } from "../messages";
import { useCatalog } from "../session/CatalogProvider";
import { useDemoSession } from "../session/DemoSessionProvider";

export function Dashboard() {
  const { session } = useDemoSession();
  const { preferences, isComplete } = useGuestPreferences();
  const { species, locations } = useCatalog();
  const [overview, setOverview] = useState<OverviewOut | null>(null);
  const [overviewError, setOverviewError] = useState<string[] | null>(null);
  const [marketItems, setMarketItems] = useState<MarketWatchItem[]>([]);

  useEffect(() => {
    let alive = true;

    void api
      .overview()
      .then((result) => {
        if (alive) setOverview(result);
      })
      .catch((error: unknown) => {
        if (alive) setOverviewError(errorMessages(error));
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!overview) {
      setMarketItems([]);
      return;
    }

    let alive = true;
    const suggestions = overview.suggestions.slice(0, 5);

    void Promise.all(
      suggestions.map(async (suggestion) => {
        try {
          const reference = await api.reference({
            species_id: suggestion.species.id,
            location_id: suggestion.location.id,
          });
          return { suggestion, points: reference.chart?.points ?? [] };
        } catch {
          return { suggestion, points: [] };
        }
      }),
    ).then((items) => {
      if (alive) setMarketItems(items);
    });

    return () => {
      alive = false;
    };
  }, [overview]);

  const favoriteNames = useMemo(
    () =>
      preferences.favoriteSpeciesIds
        .map((id) => species.find((item) => item.id === id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => item.name_en ?? item.name_ms),
    [preferences.favoriteSpeciesIds, species],
  );
  const preferredLocation = locations.find((item) => item.id === preferences.preferredLocationId);

  return (
    <>
      <PageHeader title={session ? `Welcome, ${session.name}.` : PAGES.dashboard.title} lead={PAGES.dashboard.lead}>
        <p className="hero-actions">
          <Link to="/cari" className="button">
            {DASHBOARD.findFish}
          </Link>
          {!isComplete ? (
            <Link to="/profil" className="text-link">
              {DASHBOARD.setPreferences}
            </Link>
          ) : (
            <span className="meta">{DASHBOARD.savedOnDevice}</span>
          )}
        </p>
      </PageHeader>

      {isComplete && (
        <section className="card" aria-labelledby="starting-point-heading">
          <div className="section-heading-row">
            <h2 id="starting-point-heading">{DASHBOARD.startingPointTitle}</h2>
            <Link to="/profil">{DASHBOARD.editPreferences}</Link>
          </div>
          <ul className="summary-list">
            {favoriteNames.length > 0 && (
              <li>
                <strong>{DASHBOARD.favoriteFishLabel}</strong> {favoriteNames.join(", ")}
              </li>
            )}
            {preferences.typicalBudgetRmPerKg && (
              <li>
                <strong>{DASHBOARD.budgetLabel}</strong> {rmPerKg(Number(preferences.typicalBudgetRmPerKg))}
              </li>
            )}
            {preferredLocation && (
              <li>
                <strong>{DASHBOARD.locationLabel}</strong> {preferredLocation.name}
              </li>
            )}
          </ul>
        </section>
      )}

      <div aria-live="polite">
        <ErrorMessages messages={overviewError} />
        {overview && <Overview data={overview} marketItems={marketItems} />}
        {!overview && !overviewError && <p>{DASHBOARD.loadingMarketWatch}</p>}
      </div>
    </>
  );
}
