// Offline banner for the installed app. The service worker keeps the shell it has cached, so a page
// still opens without a connection; prices, forecasts and searches do not, and every panel would
// fail on its own. One banner explains why instead of leaving the visitor with empty sections.

import { useEffect, useState } from "react";
import { useLanguage } from "../i18n";
import { WARNING_ICON } from "../messages";

/** `navigator.onLine` is a coarse hint (it only proves a network interface is up), which is enough here. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

export function OfflineNotice() {
  const online = useOnline();
  const { t } = useLanguage();
  if (online) return null;
  return (
    <p className="offline-banner" role="status">
      <span aria-hidden="true">{WARNING_ICON}</span> {t.offlineNotice}
    </p>
  );
}
