import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Notice } from "../components/Labels";
import { LocationSelect } from "../components/Pickers";
import {
  type CookingStyle,
  type GuestPreferences,
  useGuestPreferences,
} from "../guest/GuestPreferencesProvider";
import { useLanguage } from "../i18n";
import { PageHeader } from "../components/PageHeader";
import { useCatalog } from "../session/CatalogProvider";
import { useSession } from "../session/SessionProvider";

function toggle(values: string[], id: string, checked: boolean): string[] {
  return checked ? [...new Set([...values, id])] : values.filter((value) => value !== id);
}

function validBudget(value: string): boolean {
  if (!value.trim()) return true;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= 1000;
}

export function Profil() {
  const { lang, t } = useLanguage();
  const { species } = useCatalog();
  const { preferences, save, clear } = useGuestPreferences();
  const { session, completeOnboarding } = useSession();
  const navigate = useNavigate();
  /** True while the visitor is being taken through sign-in → preferences → dashboard. */
  const onboarding = Boolean(session && !session.onboardingComplete);
  const [draft, setDraft] = useState<GuestPreferences>(preferences);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const cookingStyles: { value: CookingStyle; label: string }[] = [
    { value: "", label: t.profile.cookingOptions.none },
    { value: "fried", label: t.profile.cookingOptions.fried },
    { value: "steamed", label: t.profile.cookingOptions.steamed },
    { value: "curry", label: t.profile.cookingOptions.curry },
    { value: "grilled", label: t.profile.cookingOptions.grilled },
    { value: "other", label: t.profile.cookingOptions.other },
  ];

  const update = <Key extends keyof GuestPreferences>(key: Key, value: GuestPreferences[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  };

  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validBudget(draft.typicalBudgetRmPerKg)) {
      setBudgetError(t.profile.budgetError);
      setFeedback(null);
      return;
    }

    setBudgetError(null);
    save(draft);
    setFeedback(t.profile.savedFeedback);
    if (onboarding) {
      // The first-run flow continues to the dashboard, which the guard now lets through.
      completeOnboarding();
      navigate("/dashboard");
    }
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
    setFeedback(t.profile.clearedFeedback);
  };

  return (
    <>
      <PageHeader title={t.pages.profil.title} lead={t.pages.profil.lead} />
      {onboarding && <Notice live>{t.profile.onboardingNotice}</Notice>}
      <div aria-live="polite">{feedback && <Notice live>{feedback}</Notice>}</div>
      <form className="card form" onSubmit={onSave}>
        <fieldset>
          <legend>{t.profile.favoriteQuestion}</legend>
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
                {lang === "ms" ? item.name_ms : (item.name_en ?? item.name_ms)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="guest-budget">{t.profile.budgetQuestion}</label>
          <input
            id="guest-budget"
            type="text"
            inputMode="decimal"
            value={draft.typicalBudgetRmPerKg}
            onChange={(event) => update("typicalBudgetRmPerKg", event.target.value)}
            placeholder={t.profile.budgetPlaceholder}
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
          label={t.profile.locationQuestion}
          value={draft.preferredLocationId}
          onChange={(value) => update("preferredLocationId", value)}
          allowEmpty={t.profile.locationEmpty}
        />

        <fieldset>
          <legend>{t.profile.avoidQuestion}</legend>
          <Notice>{t.profile.avoidNote}</Notice>
          <p className="meta">{t.recommendationDisclaimer}</p>
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
                {lang === "ms" ? item.name_ms : (item.name_en ?? item.name_ms)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="guest-cooking">{t.profile.cookingQuestion}</label>
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

        <button type="submit">{onboarding ? t.profile.saveAndContinueAction : t.profile.saveAction}</button>
      </form>

      <p className="meta">{t.profile.deviceOnlyNote}</p>
      <section className="clear-preferences" aria-label={t.profile.clearAction}>
        {!confirmClear ? (
          <button type="button" className="secondary" onClick={() => setConfirmClear(true)}>
            {t.profile.clearAction}
          </button>
        ) : (
          <div role="group" aria-label={t.profile.clearConfirmation}>
            <p>
              <strong>{t.profile.clearConfirmation}</strong>
            </p>
            <button type="button" className="secondary" onClick={() => setConfirmClear(false)}>
              {t.profile.cancelAction}
            </button>{" "}
            <button type="button" className="danger" onClick={onClear}>
              {t.profile.confirmClearAction}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
