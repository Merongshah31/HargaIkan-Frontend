import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useDemoSession } from "../session/DemoSessionProvider";
import { HOME, PAGES } from "../messages";

export function Home() {
  const { session } = useDemoSession();
  const destination = !session ? "/login" : session.onboardingComplete ? "/dashboard" : "/onboarding";

  return (
    <>
      <PageHeader title={PAGES.home.title} lead={PAGES.home.lead}>
        <p className="hero-actions">
          <Link to={destination} className="button">{session ? HOME.continueAction : HOME.startAction}</Link>
        </p>
      </PageHeader>
      <section className="home-intro" aria-labelledby="home-intro-title">
        <h2 id="home-intro-title">{HOME.howItWorks}</h2>
        <div className="home-features">
          <article className="card"><span className="home-feature-number">01</span><h3>{HOME.compareTitle}</h3><p>{HOME.compareText}</p></article>
          <article className="card"><span className="home-feature-number">02</span><h3>{HOME.findTitle}</h3><p>{HOME.findText}</p></article>
          <article className="card"><span className="home-feature-number">03</span><h3>{HOME.travelTitle}</h3><p>{HOME.travelText}</p></article>
        </div>
      </section>
      <p className="page-note">{HOME.demoNote}</p>
    </>
  );
}
