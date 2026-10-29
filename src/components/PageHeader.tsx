import type { ReactNode } from "react";
import { useLanguage } from "../i18n";

/** Editorial page hero with a one-line muted lead (texts from messages.ts). */
export function PageHeader({ title, lead, children }: { title: string; lead: string; children?: ReactNode }) {
  const { t } = useLanguage();
  return (
    <header className="page-header">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      {children}
    </header>
  );
}
