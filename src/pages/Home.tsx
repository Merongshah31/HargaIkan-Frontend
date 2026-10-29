import { Link } from "react-router-dom";
import { HomeFishScene } from "../components/HomeFishScene";
import { useLanguage } from "../i18n";

export function Home() {
  const { t } = useLanguage();
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-ambient" aria-hidden="true" />
        <div className="home-hero-copy">
          <div className="home-eyebrow-pill">
            <span className="home-eyebrow-dot" aria-hidden="true" />
            <p className="eyebrow">{t.eyebrow}</p>
          </div>
          <h1 id="home-title">{t.pages.home.title}</h1>
          <p className="home-lead">{t.pages.home.lead}</p>
          <div className="home-hero-actions">
            <Link to="/cari" className="button home-cta-primary">
              {t.home.startAction} <span className="home-cta-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/perjalanan" className="home-secondary-link">
              {t.home.travelAction} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="home-hero-footer">
            <p className="home-hero-note">{t.home.heroNote}</p>
            <div className="home-hero-specs" aria-hidden="true">
              {t.home.specChips.map((chip) => (
                <span className="home-spec-chip" key={chip}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="home-visual" aria-hidden="true">
          <div className="home-visual-glow" />
          <div className="home-visual-orbit home-visual-orbit-outer" />
          <div className="home-visual-orbit home-visual-orbit-one" />
          <div className="home-visual-orbit home-visual-orbit-two" />
          <div className="home-visual-crosshair home-visual-crosshair-h" />
          <div className="home-visual-crosshair home-visual-crosshair-v" />
          <HomeFishScene />
          <span className="home-visual-label home-visual-label-top">
            <span className="home-label-dot" />
            {t.home.visualTop}
          </span>
          <span className="home-visual-label home-visual-label-bottom">
            <span className="home-label-dot home-label-dot-accent" />
            {t.home.visualBottom}
          </span>
        </div>
      </section>

      <section className="home-intro" aria-labelledby="home-intro-title">
        <div className="home-section-heading">
          <div className="home-section-title-group">
            <p className="eyebrow">{t.home.sectionEyebrow}</p>
            <h2 id="home-intro-title">{t.home.howItWorks}</h2>
          </div>
          <p className="home-section-lead">{t.home.sectionLead}</p>
        </div>

        <div className="home-features">
          <article className="home-feature">
            <div className="home-feature-header">
              <span className="home-feature-number">01 / {t.home.stepLabel}</span>
              <span className="home-feature-badge" aria-hidden="true">
                {t.home.compareBadge}
              </span>
            </div>
            <div className="home-feature-graphic" aria-hidden="true">
              <svg viewBox="0 0 280 88" fill="none" role="presentation" focusable="false">
                <rect x="16" y="38" width="248" height="12" rx="6" fill="currentColor" fillOpacity="0.08" />
                <rect x="68" y="38" width="136" height="12" rx="6" className="schematic-band" />
                <line x1="136" y1="24" x2="136" y2="64" className="schematic-median" strokeWidth="2" strokeLinecap="round" />
                <circle cx="106" cy="44" r="6" className="schematic-dot" />
                <circle cx="106" cy="44" r="12" className="schematic-ring" strokeWidth="1.2" />
                <path d="M24 68 C72 64, 108 26, 136 26 C164 26, 200 64, 256 68" className="schematic-curve" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3>{t.home.compareTitle}</h3>
            <p>{t.home.compareText}</p>
            <Link to="/cari" className="home-feature-link">
              <span>{t.home.compareLink}</span>
              <span className="home-feature-arrow" aria-hidden="true">↗</span>
            </Link>
          </article>

          <article className="home-feature">
            <div className="home-feature-header">
              <span className="home-feature-number">02 / {t.home.stepLabel}</span>
              <span className="home-feature-badge" aria-hidden="true">
                {t.home.findBadge}
              </span>
            </div>
            <div className="home-feature-graphic" aria-hidden="true">
              <svg viewBox="0 0 280 88" fill="none" role="presentation" focusable="false">
                <path d="M56 44 H224" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.5" strokeDasharray="3 4" />
                <path d="M88 44 C112 20, 168 20, 192 44" className="schematic-curve" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M88 44 C112 68, 168 68, 192 44" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" />
                <rect x="36" y="28" width="52" height="32" rx="10" className="schematic-node" />
                <rect x="114" y="16" width="52" height="26" rx="8" className="schematic-node-active" />
                <rect x="114" y="48" width="52" height="24" rx="8" className="schematic-node" />
                <rect x="192" y="28" width="52" height="32" rx="10" className="schematic-node" />
                <circle cx="140" cy="29" r="3.5" className="schematic-dot" />
              </svg>
            </div>
            <h3>{t.home.findTitle}</h3>
            <p>{t.home.findText}</p>
            <Link to="/dashboard" className="home-feature-link">
              <span>{t.home.findLink}</span>
              <span className="home-feature-arrow" aria-hidden="true">↗</span>
            </Link>
          </article>

          <article className="home-feature">
            <div className="home-feature-header">
              <span className="home-feature-number">03 / {t.home.stepLabel}</span>
              <span className="home-feature-badge" aria-hidden="true">
                {t.home.travelBadge}
              </span>
            </div>
            <div className="home-feature-graphic" aria-hidden="true">
              <svg viewBox="0 0 280 88" fill="none" role="presentation" focusable="false">
                <path d="M36 58 C84 58, 96 26, 144 26 C192 26, 200 48, 244 48" className="schematic-curve" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="36" cy="58" r="4.5" className="schematic-node-dot" />
                <circle cx="144" cy="26" r="4.5" className="schematic-node-dot" />
                <circle cx="244" cy="48" r="5.5" className="schematic-dot" />
                <circle cx="244" cy="48" r="11" className="schematic-ring" strokeWidth="1.2" />
                <rect x="36" y="68" width="132" height="7" rx="3.5" className="schematic-band" />
                <rect x="174" y="68" width="70" height="7" rx="3.5" fill="currentColor" fillOpacity="0.22" />
              </svg>
            </div>
            <h3>{t.home.travelTitle}</h3>
            <p>{t.home.travelText}</p>
            <Link to="/perjalanan" className="home-feature-link">
              <span>{t.home.travelLink}</span>
              <span className="home-feature-arrow" aria-hidden="true">↗</span>
            </Link>
          </article>
        </div>
      </section>

      <aside className="home-promise">
        <div className="home-promise-copy">
          <p className="eyebrow">{t.home.promiseEyebrow}</p>
          <h2>{t.home.promiseTitle}</h2>
          <p>{t.home.promiseText}</p>
        </div>
        <div className="home-promise-pillars" aria-hidden="true">
          {t.home.pillars.map((pillar) => (
            <div className="home-pillar" key={pillar.title}>
              <span className="home-pillar-icon">{pillar.icon}</span>
              <div className="home-pillar-text">
                <strong>{pillar.title}</strong>
                <span>{pillar.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
