// TEMPORARY design-preview banner, shown only while the hardcoded preview data is on.
// Remove this file, its <PreviewRibbon /> use in Layout.tsx and the .preview-ribbon CSS with
// src/preview/ (the removal steps are listed at the top of src/preview/data.ts).

import { useLanguage } from "../i18n";
import { PREVIEW_DATA } from "../preview/flag";

export function PreviewRibbon() {
  const { t } = useLanguage();
  if (!PREVIEW_DATA) return null;
  return (
    <p className="preview-ribbon" role="note">
      <span aria-hidden="true">▲</span> {t.previewRibbon}
    </p>
  );
}
