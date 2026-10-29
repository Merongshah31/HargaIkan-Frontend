// TEMPORARY design-preview switch. Kept in its own tiny module so that src/preview/data.ts stays
// unreferenced (and is removed) in a production build. See src/preview/data.ts for the removal
// steps: this file goes with it.
//
// Written so a production build folds it to a literal false (Vite replaces import.meta.env) and
// Rollup can then drop the client's preview branch. Do not turn this into a runtime lookup such as
// .trim(), or the data would end up in every bundle.
//
// Off under Vitest, so the test suite keeps exercising the real fetch path.
export const PREVIEW_DATA =
  import.meta.env.MODE !== "test" &&
  (Boolean(import.meta.env.DEV) ||
    import.meta.env.VITE_PREVIEW_DATA === "1" ||
    import.meta.env.VITE_PREVIEW_DATA === "true" ||
    import.meta.env.VITE_PREVIEW_DATA === "yes");
