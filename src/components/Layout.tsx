import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { SourceLabelText } from "../api/types";
import { useGuestPreferences } from "../guest/GuestPreferencesProvider";
import { useDemoSession } from "../session/DemoSessionProvider";
import { useCatalog } from "../session/CatalogProvider";
import {
  BRAND,
  FOOTER_NOTE,
  LEGEND_TITLE,
  NAV_LABEL,
  NAV_LABELS,
  SKIP_LINK,
  SOURCE_SHORT_DESCRIPTIONS,
  SESSION_NAV,
  DEMO_DATA_NOTICE,
} from "../messages";
import { SourceBadge } from "./Labels";

const NAV = [
  { to: "/dashboard", label: NAV_LABELS.dashboard },
  { to: "/cari", label: NAV_LABELS.cari },
  { to: "/profil", label: NAV_LABELS.profil },
  { to: "/ramalan", label: NAV_LABELS.ramalan },
  { to: "/perjalanan", label: NAV_LABELS.perjalanan },
];

export function Layout() {
  const { session, logout } = useDemoSession();
  const { demo } = useCatalog();
  const { clear } = useGuestPreferences();
  const navigate = useNavigate();

  const onLogout = () => {
    clear();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <a href="#main" className="skip-link">
        {SKIP_LINK}
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-logo-frame">
              <img src="/hargaikan-logo.png" alt="" />
            </span>
            <span className="sr-only">{BRAND}</span>
          </Link>
          <nav aria-label={NAV_LABEL} className="nav-wrap">
            <ul className="nav">
              <li><NavLink to="/" end>{NAV_LABELS.home}</NavLink></li>
              {session?.onboardingComplete && NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {session && !session.onboardingComplete && <li><NavLink to="/onboarding">{NAV_LABELS.profil}</NavLink></li>}
            </ul>
          </nav>
          <div className="session-nav">
            {session ? <><span className="session-name">{session.name}</span><button type="button" className="secondary" onClick={onLogout}>{SESSION_NAV.logout}</button></>
              : <Link className="button" to="/login">{SESSION_NAV.login}</Link>}
          </div>
        </div>
      </header>
      {demo && <div className="demo-banner" role="status"><div className="container">{DEMO_DATA_NOTICE}</div></div>}
      <main id="main" className="container" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <h2 className="footer-title">{LEGEND_TITLE}</h2>
          <ul className="legend">
            {(Object.keys(SOURCE_SHORT_DESCRIPTIONS) as SourceLabelText[]).map((label) => (
              <li key={label}>
                <SourceBadge label={label} /> <span>{SOURCE_SHORT_DESCRIPTIONS[label]}</span>
              </li>
            ))}
          </ul>
          <p className="footer-note">{FOOTER_NOTE}</p>
        </div>
      </footer>
    </>
  );
}
