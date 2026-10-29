import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages } from "../api/client";
import type { AlertsOut, OverviewOut } from "../api/types";
import { ErrorMessages } from "../components/Labels";
import type { MarketWatchItem } from "../components/MarketWatchList";
import { Overview } from "../components/Overview";
import { PageHeader } from "../components/PageHeader";
import { SmartAlerts } from "../components/SmartAlerts";
import { priceLevel, SmartSwaps, type SwapSuggestion } from "../components/SmartSwaps";
import { rmPerKg } from "../format";
import { useGuestPreferences } from "../guest/GuestPreferencesProvider";
import { useLanguage } from "../i18n";
import { useCatalog } from "../session/CatalogProvider";

/** Favourites checked for a swap suggestion, so the dashboard stays quick. */
const MAX_SWAP_FAVOURITES = 2;

export function Dashboard() {
  const { preferences, isComplete } = useGuestPreferences();
  const { species, locations } = useCatalog();
  const { lang, t } = useLanguage();
  const [overview, setOverview] = useState<OverviewOut | null>(null);
  const [overviewError, setOverviewError] = useState<string[] | null>(null);
  const [marketItems, setMarketItems] = useState<MarketWatchItem[]>([]);
  const [alerts, setAlerts] = useState<AlertsOut | null>(null);
  const [swaps, setSwaps] = useState<SwapSuggestion[]>([]);

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
    if (!overview || overview.demo) {
      setMarketItems([]);
      return;
    }

    let alive = true;
    const suggestions = overview.suggestions.filter((suggestion) => !suggestion.demo).slice(0, 5);

    void Promise.all(
      suggestions.map(async (suggestion) => {
        try {
          const reference = await api.reference({
            species_id: suggestion.species.id,
            location_id: suggestion.location.id,
          });
          return {
            suggestion,
            points:
              !reference.demo && !reference.band?.demo && reference.chart && !reference.chart.demo
                ? reference.chart.points
                : [],
          };
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

  // Section B: weather and festivity alerts. The backend reports the deferred sources itself, so a
  // failure here only hides the section rather than inventing a warning.
  useEffect(() => {
    let alive = true;
    void api
      .alerts()
      .then((result) => {
        if (alive) setAlerts(result);
      })
      .catch(() => {
        if (alive) setAlerts(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Section C: only a favourite that is priced high earns a swap, and the suggestion itself always
  // comes from the verified similar-fish list.
  useEffect(() => {
    const favourites = preferences.favoriteSpeciesIds.slice(0, MAX_SWAP_FAVOURITES);
    const locationId = preferences.preferredLocationId;
    if (!favourites.length || !locationId) {
      setSwaps([]);
      return;
    }

    let alive = true;
    void Promise.all(
      favourites.map(async (speciesId): Promise<SwapSuggestion | null> => {
        try {
          const [reference, recommendations] = await Promise.all([
            api.reference({ species_id: speciesId, location_id: locationId }),
            api.recommendations({ species_id: speciesId, location_id: locationId }),
          ]);
          const band = reference.band;
          const swap = recommendations.items.find((item) => !item.demo);
          if (!band || band.demo || !swap) return null;
          // Same rule as the market-watch warning: the latest published week against the P75 band,
          // falling back to the band median when the chart has no points yet.
          const chart = reference.chart && !reference.chart.demo ? reference.chart : null;
          const price = chart?.points.length ? chart.points[chart.points.length - 1].median : band.median;
          const level = priceLevel(price, band);
          if (level !== "high") return null;
          return {
            favourite: { id: reference.species.id, name_ms: reference.species.name_ms },
            favouritePrice: price,
            level,
            locationName: band.location.name,
            swap,
          };
        } catch {
          return null;
        }
      }),
    ).then((items) => {
      if (alive) setSwaps(items.filter((item): item is SwapSuggestion => item !== null));
    });

    return () => {
      alive = false;
    };
  }, [preferences.favoriteSpeciesIds, preferences.preferredLocationId]);

  const favoriteNames = useMemo(
    () =>
      preferences.favoriteSpeciesIds
        .map((id) => species.find((item) => item.id === id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => (lang === "ms" ? item.name_ms : (item.name_en ?? item.name_ms))),
    [preferences.favoriteSpeciesIds, species, lang],
  );
  const preferredLocation = locations.find((item) => item.id === preferences.preferredLocationId);

  return (
    <>
      <PageHeader title={t.pages.dashboard.title} lead={t.pages.dashboard.lead}>
        <p className="hero-actions">
          <Link to="/cari" className="button">
            {t.dashboard.findFish}
          </Link>
          {!isComplete ? (
            <Link to="/profil" className="text-link">
              {t.dashboard.setPreferences}
            </Link>
          ) : (
            <span className="meta">{t.dashboard.savedOnDevice}</span>
          )}
        </p>
      </PageHeader>

      {isComplete && (
        <section className="card" aria-labelledby="starting-point-heading">
          <div className="section-heading-row">
            <h2 id="starting-point-heading">{t.dashboard.startingPointTitle}</h2>
            <Link to="/profil">{t.dashboard.editPreferences}</Link>
          </div>
          <ul className="summary-list">
            {favoriteNames.length > 0 && (
              <li>
                <strong>{t.dashboard.favoriteFishLabel}</strong> {favoriteNames.join(", ")}
              </li>
            )}
            {preferences.typicalBudgetRmPerKg && (
              <li>
                <strong>{t.dashboard.budgetLabel}</strong> {rmPerKg(Number(preferences.typicalBudgetRmPerKg))}
              </li>
            )}
            {preferredLocation && (
              <li>
                <strong>{t.dashboard.locationLabel}</strong> {preferredLocation.name}
              </li>
            )}
          </ul>
        </section>
      )}

      <div aria-live="polite">
        <ErrorMessages messages={overviewError} />
        {overview && <Overview data={overview} marketItems={marketItems} />}
        {!overview && !overviewError && <p>{t.dashboard.loadingMarketWatch}</p>}
      </div>

      {alerts && <SmartAlerts data={alerts} />}

      <SmartSwaps items={swaps} hasPreferences={preferences.favoriteSpeciesIds.length > 0} />
    </>
  );
}
