import { useEffect, useState, type FormEvent } from "react";
import { api, errorMessages } from "../api/client";
import type { TravelIn, TravelOut, TravelValueOut } from "../api/types";
import { ErrorMessages, Labels, Notice, SourceBadge } from "../components/Labels";
import { LocationSelect, SpeciesSelect } from "../components/Pickers";
import { period, travelValue } from "../format";
import { translateApiText, useLanguage } from "../i18n";
import { PageHeader } from "../components/PageHeader";
import { useCatalog } from "../session/CatalogProvider";

type Mode = TravelIn["mode"];
type FishSource = "Input pengguna" | "Harga sejarah";
interface Prefill { value: string; detail: string; }

const opt = (s: string) => s.trim() || null;

function ValueTable({ caption, rows, fishOverride }: { caption: string; rows: TravelValueOut[]; fishOverride?: { label: string; note: string } }) {
  const { lang, t } = useLanguage();
  return (
    <div className="table-wrap">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.travel.colItem}</th>
            <th scope="col">{t.travel.colValue}</th>
            <th scope="col">{t.travel.colSource}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => {
            const override = v.key === "fish_price_rm_per_kg" ? fishOverride : undefined;
            return (
              <tr key={v.key}>
                <th scope="row">{translateApiText(v.name, lang)}</th>
                <td className="num">{travelValue(v.value, v.display, v.unit, lang)}</td>
                <td>
                  {override ? <Labels source={override.label} /> : <Labels source={v.display_label} />}
                  {(override?.note || v.note) && <span className="meta"> ({translateApiText(override?.note ?? v.note ?? "", lang)})</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Perjalanan() {
  const { lang, t } = useLanguage();
  const catalog = useCatalog();
  const [mode, setMode] = useState<Mode>("kereta");
  const [distance, setDistance] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [fuelType, setFuelType] = useState<"RON95" | "RON97">("RON95");
  const [fuelPrice, setFuelPrice] = useState("");
  const [toll, setToll] = useState("");
  const [parking, setParking] = useState("");
  const [fare, setFare] = useState("");
  const [transitMode, setTransitMode] = useState<"" | "mrt" | "lrt" | "monorel" | "bas">("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [returnTrip, setReturnTrip] = useState(false);
  const [fishPrice, setFishPrice] = useState("");
  const [fishSource, setFishSource] = useState<FishSource>("Input pengguna");
  const [qty, setQty] = useState("");
  const [prefSpecies, setPrefSpecies] = useState("");
  const [prefLocation, setPrefLocation] = useState("");
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [prefillNotice, setPrefillNotice] = useState<string[] | null>(null);
  const [result, setResult] = useState<TravelOut | null>(null);
  const [resultFish, setResultFish] = useState<Prefill | null>(null);
  const [error, setError] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const modes: { value: Mode; label: string }[] = [
    { value: "kereta", label: t.travelModeLabels.kereta },
    { value: "pengangkutan_awam", label: t.travelModeLabels.pengangkutan_awam },
  ];

  useEffect(() => {
    if (!prefLocation && catalog.defaultLocationId) setPrefLocation(catalog.defaultLocationId);
  }, [catalog.defaultLocationId, prefLocation]);

  const prefillPrice = async () => {
    if (!prefSpecies || !prefLocation) return;
    setPrefillNotice(null);
    try {
      const r = await api.reference({ species_id: prefSpecies, location_id: prefLocation });
      if (r.band && !r.band.demo && !r.demo) {
        const p = {
          value: r.band.median.toFixed(2),
          detail: `median ${r.band.location.name}, ${period(r.band.period_start, r.band.period_end, lang)}`,
        };
        setPrefill(p);
        setFishPrice(p.value);
        setFishSource("Harga sejarah");
        setPrefillNotice(r.message ? [r.message] : null);
      } else {
        setPrefill(null);
        if (fishSource === "Harga sejarah") {
          setFishPrice("");
          setFishSource("Input pengguna");
        }
        setPrefillNotice([r.band?.demo || r.demo ? t.priceDataUnavailable : r.message ?? t.priceDataUnavailable]);
      }
    } catch (err) {
      setPrefillNotice(errorMessages(err));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body: TravelIn = { mode, return_trip: returnTrip, fish_price_rm_per_kg: opt(fishPrice), qty_kg: opt(qty) };
    if (mode === "kereta") {
      Object.assign(body, {
        distance_km: opt(distance),
        fuel_efficiency_km_per_l: opt(efficiency),
        fuel_type: fuelType,
        fuel_price_rm_per_l: opt(fuelPrice),
        toll_rm: opt(toll),
        parking_rm: opt(parking),
      });
    } else {
      Object.assign(body, {
        transit_fare_rm: opt(fare),
        transit_mode: transitMode || null,
        origin: opt(origin),
        destination: opt(destination),
      });
    }
    setLoading(true);
    setError(null);
    try {
      setResult(await api.travel(body));
      setResultFish(fishSource === "Harga sejarah" && prefill && fishPrice === prefill.value ? prefill : null);
    } catch (err) {
      setResult(null);
      setError(errorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title={t.pages.perjalanan.title} lead={t.pages.perjalanan.lead} />
      <p className="page-note">{t.travelNoGuess}</p>
      <form className="card form" onSubmit={onSubmit} noValidate>
        <fieldset className="segmented-field" role="radiogroup" aria-labelledby="mode-legend">
          <legend id="mode-legend">{t.travel.modeLegend}</legend>
          <div className="segmented">
            {modes.map((m) => (
              <label key={m.value} className="segment">
                <input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {mode === "kereta" ? (
          <fieldset className="field-grid">
            <legend>{t.travel.carLegend}</legend>
            <div className="field">
              <label htmlFor="t-distance">{t.travel.distanceLabel}</label>
              <input id="t-distance" inputMode="decimal" maxLength={32} value={distance} onChange={(e) => setDistance(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-eff">{t.travel.efficiencyLabel}</label>
              <input id="t-eff" inputMode="decimal" maxLength={32} value={efficiency} onChange={(e) => setEfficiency(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-fueltype">{t.travel.fuelTypeLabel}</label>
              <select id="t-fueltype" value={fuelType} onChange={(e) => setFuelType(e.target.value as "RON95" | "RON97")}>
                <option>RON95</option>
                <option>RON97</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="t-fuelprice">{t.travel.fuelPriceLabel}</label>
              <input id="t-fuelprice" inputMode="decimal" maxLength={32} value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-toll">{t.travel.tollLabel}</label>
              <input id="t-toll" inputMode="decimal" maxLength={32} value={toll} onChange={(e) => setToll(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-parking">{t.travel.parkingLabel}</label>
              <input id="t-parking" inputMode="decimal" maxLength={32} value={parking} onChange={(e) => setParking(e.target.value)} />
            </div>
          </fieldset>
        ) : (
          <fieldset className="field-grid">
            <legend>{t.travel.publicTransportLegend}</legend>
            <div className="field">
              <label htmlFor="t-fare">{t.travel.fareLabel}</label>
              <input id="t-fare" inputMode="decimal" maxLength={32} value={fare} onChange={(e) => setFare(e.target.value)} aria-describedby="t-fare-help" />
              <p id="t-fare-help" className="meta">{t.travel.fareHelp}</p>
            </div>
            <div className="field">
              <label htmlFor="t-transit">{t.travel.transitTypeLabel}</label>
              <select id="t-transit" value={transitMode} onChange={(e) => setTransitMode(e.target.value as typeof transitMode)}>
                <option value="">{t.travel.transitNotSelected}</option>
                <option value="mrt">MRT</option>
                <option value="lrt">LRT</option>
                <option value="monorel">{t.travel.transitMonorail}</option>
                <option value="bas">{t.travel.transitBus}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="t-origin">{t.travel.originLabel}</label>
              <input id="t-origin" maxLength={200} value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-dest">{t.travel.destinationLabel}</label>
              <input id="t-dest" maxLength={200} value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
          </fieldset>
        )}
        <label className="check switch">
          <input type="checkbox" checked={returnTrip} onChange={(e) => setReturnTrip(e.target.checked)} />
          {t.travel.roundTripLabel}
        </label>
        <fieldset className="field-grid">
          <legend>{t.travel.fishLegend}</legend>
          <div className="field">
            <label htmlFor="t-fish">
              {t.travel.fishPriceLabel} <SourceBadge label={fishSource} />
            </label>
            <input
              id="t-fish"
              inputMode="decimal"
              maxLength={32}
              value={fishPrice}
              onChange={(e) => {
                setFishPrice(e.target.value);
                setFishSource("Input pengguna");
              }}
            />
            {fishSource === "Harga sejarah" && prefill && (
              <p className="meta">
                {t.travel.filledFromPrefix} {prefill.detail}.
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="t-qty">{t.travel.qtyLabel}</label>
            <input id="t-qty" inputMode="decimal" maxLength={32} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <details>
            <summary>{t.travel.prefillSummary}</summary>
            <SpeciesSelect id="t-pref-species" value={prefSpecies} onChange={setPrefSpecies} />
            <LocationSelect id="t-pref-location" value={prefLocation} onChange={setPrefLocation} />
            <button type="button" className="secondary" onClick={() => void prefillPrice()} disabled={!prefSpecies || !prefLocation}>
              {t.travel.useMedianAction}
            </button>
            <div aria-live="polite">{prefillNotice?.map((m) => <Notice key={m}>{m}</Notice>)}</div>
          </details>
        </fieldset>
        <button type="submit" disabled={loading}>
          {t.travel.calculateAction}
        </button>
      </form>
      <div aria-live="polite" aria-busy={loading}>
        {loading && <p>{t.loading}</p>}
        <ErrorMessages messages={error} />
        {result && (
          <section className="card" aria-labelledby="travel-result">
            <h2 id="travel-result">{t.travel.resultHeading}</h2>
            {(result.message || !result.estimated) && (
              <Notice tone="warning">{result.message ?? t.travel.notEstimatedFallback}</Notice>
            )}
            {result.inputs.length > 0 && (
              <ValueTable
                caption={t.travel.captionInputs}
                rows={result.inputs}
                fishOverride={resultFish ? { label: "Harga sejarah", note: resultFish.detail } : undefined}
              />
            )}
            <ValueTable caption={t.travel.captionComponents} rows={result.components} />
            {result.fare_source && (
              <p className="meta">
                {t.travel.fareSourcePrefix} <SourceBadge label={result.fare_source} />
                {result.fare_source_detail && ` ${result.fare_source_detail}`}
              </p>
            )}
            <ValueTable caption={t.travel.captionSeparate} rows={[result.travel_total, result.fish_cost]} />
            <ValueTable caption={t.travel.captionTotal} rows={[result.grand_total, result.effective_rm_per_kg]} />
            <ul className="notes">
              {result.notes.map((n) => (
                <li key={n}>{translateApiText(n, lang)}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
