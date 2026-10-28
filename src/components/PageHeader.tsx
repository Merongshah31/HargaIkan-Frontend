import type { ReactNode } from "react";
import { EYEBROW } from "../messages";

/** Editorial page hero with a one-line muted lead (texts from messages.ts). */
export function PageHeader({ title, lead, children }: { title: string; lead: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <p className="eyebrow">{EYEBROW}</p>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      {children}
    </header>
  );
}
