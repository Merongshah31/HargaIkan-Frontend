import type { LocationOut } from "../api/types";
import { useLanguage } from "../i18n";
import { useCatalog } from "../session/CatalogProvider";
import { ErrorMessages } from "./Labels";

const LEVEL_ORDER = ["nasional", "negeri", "kawasan", "pasar", "premis"];

export function groupLocations(locations: LocationOut[]): [string, LocationOut[]][] {
  const groups = new Map<string, LocationOut[]>();
  for (const location of locations) {
    const items = groups.get(location.level) ?? [];
    items.push(location);
    groups.set(location.level, items);
  }
  return [...groups.entries()].sort((left, right) => LEVEL_ORDER.indexOf(left[0]) - LEVEL_ORDER.indexOf(right[0]));
}

interface PickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  allowEmpty?: string;
}

export function LocationSelect({
  id,
  value,
  onChange,
  label,
  disabled,
  allowEmpty,
}: PickerProps) {
  const { locations, locationsError } = useCatalog();
  const { t } = useLanguage();
  const resolvedLabel = label ?? t.pickers.location;

  return (
    <div className="field">
      <label htmlFor={id}>{resolvedLabel}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {allowEmpty !== undefined && <option value="">{allowEmpty}</option>}
        {groupLocations(locations).map(([level, items]) => (
          <optgroup key={level} label={t.levelLabels[level] ?? level}>
            {items.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ErrorMessages messages={locationsError} />
    </div>
  );
}

export function SpeciesSelect({
  id,
  value,
  onChange,
  label,
  disabled,
  allowEmpty,
}: PickerProps) {
  const { species, speciesError } = useCatalog();
  const { lang, t } = useLanguage();
  const resolvedLabel = label ?? t.pickers.fish;
  const resolvedAllowEmpty = allowEmpty ?? t.pickers.chooseFish;

  return (
    <div className="field">
      <label htmlFor={id}>{resolvedLabel}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        <option value="">{resolvedAllowEmpty}</option>
        {species.map((item) => (
          <option key={item.id} value={item.id}>
            {lang === "ms" ? item.name_ms : (item.name_en ?? item.name_ms)}
          </option>
        ))}
      </select>
      <ErrorMessages messages={speciesError} />
    </div>
  );
}
