import type { VerdictOut } from "../api/types";
import { translateApiText, useLanguage } from "../i18n";

export function Verdict({ verdict }: { verdict: VerdictOut }) {
  const { lang } = useLanguage();
  return (
    <p className={`verdict verdict-${verdict.kind}`} data-testid="verdict">
      <span aria-hidden="true" className="verdict-icon">
        {verdict.icon}
      </span>{" "}
      <strong>{translateApiText(verdict.text, lang)}</strong>
    </p>
  );
}
