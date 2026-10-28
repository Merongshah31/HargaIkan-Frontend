import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Notice } from "../components/Labels";
import { LocationSelect } from "../components/Pickers";
import {
  type CookingStyle,
  type GuestPreferences,
  useGuestPreferences,
} from "../guest/GuestPreferencesProvider";
import { PAGES, PROFILE, RECOMMENDATION_DISCLAIMER } from "../messages";
import { PageHeader } from "../components/PageHeader";
import { useCatalog } from "../session/CatalogProvider";
import { useDemoSession } from "../session/DemoSessionProvider";

const cookingStyles: { value: CookingStyle; label: string }[] = [
  { value: "", label: PROFILE.cookingOptions.none },
  { value: "fried", label: PROFILE.cookingOptions.fried },
  { value: "steamed", label: PROFILE.cookingOptions.steamed },
  { value: "curry", label: PROFILE.cookingOptions.curry },
  { value: "grilled", label: PROFILE.cookingOptions.grilled },
  { value: "other", label: PROFILE.cookingOptions.other },
];

function toggle(values: string[], id: string, checked: boolean): string[] {
  return checked ? [...new Set([...values, id])] : values.filter((value) => value !== id);
}

function validBudget(value: string): boolean {
  if (!value.trim()) return true;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= 1000;
}

export function Profil({ onboarding = false }: { onboarding?: boolean }) {
  const { species } = useCatalog();
  const { preferences, save, clear } = useGuestPreferences();
  const { completeOnboarding } = useDemoSession();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<GuestPreferences>(preferences);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const update = <Key extends keyof GuestPreferences>(key: Key, value: GuestPreferences[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  };

  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validBudget(draft.typicalBudgetRmPerKg)) {
      setBudgetError(PROFILE.budgetError);
      setFeedback(null);
      return;
    }

    setBudgetError(null);
    save(draft);
    if (onboarding) {
      completeOnboarding();
      navigate("/dashboard", { replace: true });
      return;
    }
    setFeedback(PROFILE.savedFeedback);
  };

  const onClear = () => {
    clear();
    setDraft({
      favoriteSpeciesIds: [],
      typicalBudgetRmPerKg: "",
      preferredLocationId: "",
      avoidedSpeciesIds: [],
      cookingStyle: "",
    });
    setConfirmClear(false);
    setBudgetError(null);
    setFeedback(PROFILE.clearedFeedback);
  };

  return (
    <>
      <PageHeader title={onboarding ? PAGES.onboarding.title : PAGES.profil.title}
        lead={onboarding ? PAGES.onboarding.lead : PAGES.profil.lead} />
      <div aria-live="polite">{feedback && <Notice live>{feedback}</Notice>}</div>
      <form className="card form" onSubmit={onSave}>
        <fieldset>
          <legend>{PROFILE.favoriteQuestion}</legend>
          <div className="check-grid">
            {species.map((item) => (
              <label key={item.id} className="check">
                <input
                  type="checkbox"
                  checked={draft.favoriteSpeciesIds.includes(item.id)}
                  onChange={(event) =>
                    update(
                      "favoriteSpeciesIds",
                      toggle(draft.favoriteSpeciesIds, item.id, event.target.checked),
                    )
                  }
                />
                {item.name_en ?? item.name_ms}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="guest-budget">{PROFILE.budgetQuestion}</label>
          <input
            id="guest-budget"
            type="text"
            inputMode="decimal"
            value={draft.typicalBudgetRmPerKg}
            onChange={(event) => update("typicalBudgetRmPerKg", event.target.value)}
            placeholder={PROFILE.budgetPlaceholder}
            aria-describedby={budgetError ? "guest-budget-error" : undefined}
          />
          {budgetError && (
            <p id="guest-budget-error" className="field-error" role="alert">
              {budgetError}
            </p>
          )}
        </div>

        <LocationSelect
          id="guest-location"
          label={PROFILE.locationQuestion}
          value={draft.preferredLocationId}
          onChange={(value) => update("preferredLocationId", value)}
          allowEmpty={PROFILE.locationEmpty}
        />

        <fieldset>
          <legend>{PROFILE.avoidQuestion}</legend>
          <Notice>{PROFILE.avoidNote}</Notice>
          <p className="meta">{RECOMMENDATION_DISCLAIMER}</p>
          <div className="check-grid">
            {species.map((item) => (
              <label key={item.id} className="check">
                <input
                  type="checkbox"
                  checked={draft.avoidedSpeciesIds.includes(item.id)}
                  onChange={(event) =>
                    update(
                      "avoidedSpeciesIds",
                      toggle(draft.avoidedSpeciesIds, item.id, event.target.checked),
                    )
                  }
                />
                {item.name_en ?? item.name_ms}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="guest-cooking">{PROFILE.cookingQuestion}</label>
          <select
            id="guest-cooking"
            value={draft.cookingStyle}
            onChange={(event) => update("cookingStyle", event.target.value as CookingStyle)}
          >
            {cookingStyles.map((style) => (
              <option key={style.value || "none"} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">{onboarding ? PROFILE.startAction : PROFILE.saveAction}</button>
      </form>

      <p className="meta">{PROFILE.deviceOnlyNote}</p>
      {!onboarding && <section className="clear-preferences" aria-label={PROFILE.clearAction}>
        {!confirmClear ? (
          <button type="button" className="secondary" onClick={() => setConfirmClear(true)}>
            {PROFILE.clearAction}
          </button>
        ) : (
          <div role="group" aria-label={PROFILE.clearConfirmation}>
            <p>
              <strong>{PROFILE.clearConfirmation}</strong>
            </p>
            <button type="button" className="secondary" onClick={() => setConfirmClear(false)}>
              {PROFILE.cancelAction}
            </button>{" "}
            <button type="button" className="danger" onClick={onClear}>
              {PROFILE.confirmClearAction}
            </button>
          </div>
        )}
      </section>}
    </>
  );
}
