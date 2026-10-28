import { Link, NavLink, Outlet } from "react-router-dom";
import type { SourceLabelText } from "../api/types";
import {
  BRAND,
  FOOTER_NOTE,
  LEGEND_TITLE,
  NAV_LABEL,
  NAV_LABELS,
  SKIP_LINK,
  SOURCE_SHORT_DESCRIPTIONS,
} from "../messages";
import { SourceBadge } from "./Labels";

const NAV = [
  { to: "/", label: NAV_LABELS.dashboard, end: true },
  { to: "/cari", label: NAV_LABELS.cari },
  { to: "/profil", label: NAV_LABELS.profil },
  { to: "/ramalan", label: NAV_LABELS.ramalan },
  { to: "/perjalanan", label: NAV_LABELS.perjalanan },
];

export function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        {SKIP_LINK}
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            {BRAND}
          </Link>
          <nav aria-label={NAV_LABEL} className="nav-wrap">
            <ul className="nav">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
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
