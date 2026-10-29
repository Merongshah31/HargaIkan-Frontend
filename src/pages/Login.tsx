import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useGuestPreferences } from "../guest/GuestPreferencesProvider";
import { useLanguage } from "../i18n";
import { useSession } from "../session/SessionProvider";

/**
 * Sign-in step of the review flow. There is no account and no token: the name is device-only state
 * (see src/session/SessionProvider.tsx), and the next step is always the preferences page.
 */
export function Login() {
  const { session, signIn, signOut } = useSession();
  const { clear } = useGuestPreferences();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    // A new visitor starts from an empty profile, not from the previous visitor's device data.
    clear();
    signIn(name);
    navigate("/profil", { replace: true });
  };

  return (
    <>
      <PageHeader title={t.pages.login.title} lead={t.pages.login.lead} />
      {session && (
        <p className="meta">
          {t.login.alreadyInTitle}: <strong>{session.name}</strong>{" "}
          <button type="button" className="secondary" onClick={signOut}>
            {t.login.signOutAction}
          </button>
        </p>
      )}
      <form className="card form login-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-name">{t.login.nameLabel}</label>
          <input
            id="login-name"
            value={name}
            maxLength={60}
            autoComplete="nickname"
            onChange={(event) => {
              setName(event.target.value);
              setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? "login-name-error" : undefined}
            placeholder={t.login.namePlaceholder}
          />
          {error && (
            <p id="login-name-error" className="field-error" role="alert">
              {t.login.nameError}
            </p>
          )}
        </div>
        <button type="submit">{t.login.continueAction}</button>
      </form>
      <p className="page-note">{t.login.sessionNote}</p>
    </>
  );
}
