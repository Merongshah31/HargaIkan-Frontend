import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PageHeader } from "./components/PageHeader";
import { LanguageProvider, useLanguage } from "./i18n";
import { CariIkan } from "./pages/CariIkan";
import { Dashboard } from "./pages/Dashboard";
import { Perjalanan } from "./pages/Perjalanan";
import { Profil } from "./pages/Profil";
import { Ramalan } from "./pages/Ramalan";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { GuestPreferencesProvider } from "./guest/GuestPreferencesProvider";
import { CatalogProvider } from "./session/CatalogProvider";
import { RequireSession } from "./session/RequireSession";
import { SessionProvider } from "./session/SessionProvider";

function NotFound() {
  const { t } = useLanguage();
  return (
    <PageHeader title={t.pages.notFound.title} lead={t.pages.notFound.lead}>
      <p className="hero-actions">
        <Link to="/" className="button">
          {t.backToDashboard}
        </Link>
      </p>
    </PageHeader>
  );
}

/** The dashboard needs the sign-in + preferences steps; every other page stays public. */
export function App() {
  return (
    <LanguageProvider>
      <GuestPreferencesProvider>
        <SessionProvider>
          <CatalogProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route
                  path="dashboard"
                  element={
                    <RequireSession>
                      <Dashboard />
                    </RequireSession>
                  }
                />
                <Route path="cari" element={<CariIkan />} />
                <Route path="login" element={<Login />} />
                <Route path="profil" element={<Profil />} />
                <Route path="ramalan" element={<Ramalan />} />
                <Route path="perjalanan" element={<Perjalanan />} />
                <Route path="onboarding" element={<Navigate to="/profil" replace />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CatalogProvider>
        </SessionProvider>
      </GuestPreferencesProvider>
    </LanguageProvider>
  );
}
