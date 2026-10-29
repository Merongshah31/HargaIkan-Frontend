import { Link, NavLink, Outlet } from "react-router-dom";
import type { SourceLabelText } from "../api/types";
import { useLanguage } from "../i18n";
import { useSession } from "../session/SessionProvider";
import { SourceBadge } from "./Labels";
import { OfflineNotice } from "./OfflineNotice";

export function Layout() {
  const { session, signOut } = useSession();
  const { lang, setLang, t } = useLanguage();

  const navItems = [
    { to: "/dashboard", label: t.navLabels.dashboard },
    { to: "/cari", label: t.navLabels.cari },
    { to: "/profil", label: t.navLabels.profil },
    { to: "/ramalan", label: t.navLabels.ramalan },
    { to: "/perjalanan", label: t.navLabels.perjalanan },
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        {t.skipLink}
      </a>
      <OfflineNotice />
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-logo-frame">
              <img src="/hargaikan-logo.png" alt="" />
            </span>
            <span className="sr-only">{t.brand}</span>
          </Link>
          <nav aria-label={t.navLabel} className="nav-wrap">
            <ul className="nav">
              <li>
                <NavLink to="/" end>
                  {t.navLabels.home}
                </NavLink>
              </li>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-action">
            <div className="lang-switch" role="group" aria-label={t.langSwitchLabel}>
              <button
                type="button"
                className={lang === "en" ? "lang-btn active" : "lang-btn"}
                aria-pressed={lang === "en"}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === "ms" ? "lang-btn active" : "lang-btn"}
                aria-pressed={lang === "ms"}
                onClick={() => setLang("ms")}
              >
                BM
              </button>
            </div>
            {session ? (
              <span className="header-session">
                <span className="header-session-name">{session.name}</span>
                <button type="button" className="secondary" onClick={signOut}>
                  {t.login.signOutAction}
                </button>
              </span>
            ) : (
              <Link className="text-link" to="/login">
                {t.login.linkLabel}
              </Link>
            )}
            <Link className="button" to="/cari">
              {t.headerAction}
            </Link>
          </div>
        </div>
      </header>
      <main id="main" className="container" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <h2 className="footer-title">{t.legendTitle}</h2>
          <ul className="legend">
            {(Object.keys(t.sourceShortDescriptions) as SourceLabelText[]).map((label) => (
              <li key={label}>
                <SourceBadge label={label} /> <span>{t.sourceShortDescriptions[label]}</span>
              </li>
            ))}
          </ul>
          <p className="footer-note">{t.footerNote}</p>
        </div>
      </footer>
    </>
  );
}
