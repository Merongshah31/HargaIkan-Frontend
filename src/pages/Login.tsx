import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useGuestPreferences } from "../guest/GuestPreferencesProvider";
import { LOGIN, PAGES } from "../messages";
import { useDemoSession } from "../session/DemoSessionProvider";

export function Login() {
  const { session, login } = useDemoSession();
  const { clear } = useGuestPreferences();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  if (session) return <Navigate to={session.onboardingComplete ? "/dashboard" : "/onboarding"} replace />;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    clear();
    login(name);
    navigate("/onboarding", { replace: true });
  };

  return (
    <>
      <PageHeader title={PAGES.login.title} lead={PAGES.login.lead} />
      <form className="card form login-form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="demo-name">{LOGIN.nameLabel}</label>
          <input id="demo-name" value={name} maxLength={60} autoComplete="nickname"
            onChange={(event) => { setName(event.target.value); setError(false); }}
            aria-invalid={error} aria-describedby={error ? "demo-name-error" : undefined}
            placeholder={LOGIN.namePlaceholder} />
          {error && <p id="demo-name-error" className="field-error" role="alert">{LOGIN.nameError}</p>}
        </div>
        <button type="submit">{LOGIN.continueAction}</button>
      </form>
      <p className="meta">{LOGIN.sessionNote}</p>
    </>
  );
}
