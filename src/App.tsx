import { Link, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PageHeader } from "./components/PageHeader";
import { BACK_TO_DASHBOARD, PAGES } from "./messages";
import { CariIkan } from "./pages/CariIkan";
import { Dashboard } from "./pages/Dashboard";
import { Perjalanan } from "./pages/Perjalanan";
import { Profil } from "./pages/Profil";
import { Ramalan } from "./pages/Ramalan";
import { GuestPreferencesProvider } from "./guest/GuestPreferencesProvider";
import { CatalogProvider } from "./session/CatalogProvider";

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

/** Routes and public browser-only providers; main.tsx supplies the router. */
export function App() {
  return (
    <GuestPreferencesProvider>
      <CatalogProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cari" element={<CariIkan />} />
            <Route path="profil" element={<Profil />} />
            <Route path="ramalan" element={<Ramalan />} />
            <Route path="perjalanan" element={<Perjalanan />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CatalogProvider>
    </GuestPreferencesProvider>
  );
}
