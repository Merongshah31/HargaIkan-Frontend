# HargaIkan frontend

React 18 + TypeScript + Vite 6 interface for the FastAPI backend in `../backend`. The public homepage leads to a display-name demo login, the five-question preferences form, then the dashboard. The demo login is browser-only and uses no JWT or backend account.

## Local development

Run the backend first from `../backend` in its local in-memory mode. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend origin, then start the frontend:

```powershell
npm install
Copy-Item .env.example .env
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run build      # typecheck + Vite build to dist/
```

The browser calls `${VITE_API_BASE_URL}/api/v1` when the variable is set. Use an origin such as `http://127.0.0.1:8000`, without `/api/v1`. If unset, requests use relative `/api/v1` and the Vite development proxy or Vercel rewrite. The API URL is public configuration; never put Supabase or other secrets in `VITE_` variables.

## Deployment

Set the Vercel project root directory to `frontend` and set `VITE_API_BASE_URL` to the deployed Render origin. Set the backend `CORS_ORIGINS` to the Vercel origin. `vercel.json` retains a same-origin API rewrite as a fallback and the SPA route fallback.

All Supabase keys and Render secrets stay under `../backend`; none belong in this frontend repository or browser bundle.

## Privacy

The display name and onboarding status use `sessionStorage` key `hargaikan.demoSession.v1`; they are cleared on logout or tab close. Preferences use the versioned local browser key `hargaikan.guestPreferences.v1`. They are written when the visitor saves the onboarding or profile form, never sent to FastAPI, and cleared on logout or using **Clear preferences**. No free-text allergy information is collected; visitors may only choose fish to avoid and are shown the medical disclaimer. UI route guards only guide the demo flow; they are not authentication.

Prices, savings, fares, and coordinates are never computed or invented in the frontend. Source labels identify the origin of each displayed number, and no non-production data disclosure is shown in the UI.

## Design

The interface uses the tokens in `src/styles.css`: a restrained Apple-style system type stack, an 8px spacing scale, accessible focus states, source-label capsules, and light/dark color tokens. Add pages with the established `PageHeader`, `.card`, `.notice`, `.tiles`, and button patterns rather than raw colors or ad hoc spacing.
