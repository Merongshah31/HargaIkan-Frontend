import { Link, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { Layout } from "./components/Layout";
import { PageHeader } from "./components/PageHeader";
import { BACK_TO_DASHBOARD, PAGES } from "./messages";
import { CariIkan } from "./pages/CariIkan";
import { Dashboard } from "./pages/Dashboard";
import { Perjalanan } from "./pages/Perjalanan";
import { Profil } from "./pages/Profil";
import { Ramalan } from "./pages/Ramalan";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { GuestPreferencesProvider } from "./guest/GuestPreferencesProvider";
import { CatalogProvider } from "./session/CatalogProvider";
import { DemoSessionProvider, useDemoSession } from "./session/DemoSessionProvider";

function RequireDemo({ children, onboarding = false }: { children: ReactNode; onboarding?: boolean }) {
  const { session } = useDemoSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!session.onboardingComplete && !onboarding) return <Navigate to="/onboarding" replace />;
  if (session.onboardingComplete && onboarding) return <Navigate to="/dashboard" replace />;
  return children;
}

function NotFound() {
  return (
    <PageHeader title={PAGES.notFound.title} lead={PAGES.notFound.lead}>
      <p className="hero-actions">
        <Link to="/" className="button">
          {BACK_TO_DASHBOARD}
        </Link>
      </p>
    </PageHeader>
  );
}

/** Routes and browser-only demo state; API calls remain public and token-free. */
export function App() {
  return (
    <GuestPreferencesProvider>
      <DemoSessionProvider>
        <CatalogProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="onboarding" element={<RequireDemo onboarding><Profil onboarding /></RequireDemo>} />
              <Route path="dashboard" element={<RequireDemo><Dashboard /></RequireDemo>} />
              <Route path="cari" element={<RequireDemo><CariIkan /></RequireDemo>} />
              <Route path="profil" element={<RequireDemo><Profil /></RequireDemo>} />
              <Route path="ramalan" element={<RequireDemo><Ramalan /></RequireDemo>} />
              <Route path="perjalanan" element={<RequireDemo><Perjalanan /></RequireDemo>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CatalogProvider>
      </DemoSessionProvider>
    </GuestPreferencesProvider>
  );
}
