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

If you use **Command Prompt** rather than PowerShell, start the backend from `../backend` with:

```bat
set "DATA_BACKEND=memory"
D:\hargaikan-venv\Scripts\python.exe -m uvicorn hargaikan.api.main:app --host 127.0.0.1 --port 8000
```

If port 8000 is already serving the API, use that process. Check `http://127.0.0.1:8000/api/v1/health` before starting a second one. If you need another port, start Uvicorn on `8001` and set the local frontend `.env` to `VITE_API_BASE_URL=http://127.0.0.1:8001`, then restart Vite.

## Deployment

Set the Vercel project root directory to `frontend` and set `VITE_API_BASE_URL` to the deployed Render origin. Set the backend `CORS_ORIGINS` to the Vercel origin. `vercel.json` retains a same-origin API rewrite as a fallback and the SPA route fallback.

For **Cloudflare Pages**, use `npm run build` and output directory `dist`. This `frontend/` folder is itself a Git repository, so use its repository root as the Cloudflare root directory; use `frontend` only if you later publish the whole parent project as one repository. In **Settings → Variables and Secrets**, set the Production build variable `VITE_API_BASE_URL` to the public HTTPS backend origin, for example `https://your-api.example.com` (only after `/api/v1/health` returns JSON with `"status":"ok"`). Redeploy after changing it: Vite puts the value into the built JavaScript. Also include the exact Pages site origin in the backend's `CORS_ORIGINS`. The Pages build now rejects localhost, `127.0.0.1`, and missing API URLs.

All Supabase keys and Render secrets stay under `../backend`; none belong in this frontend repository or browser bundle.

## Privacy

The display name and onboarding status use `sessionStorage` key `hargaikan.demoSession.v1`; they are cleared on logout or tab close. Preferences use the versioned local browser key `hargaikan.guestPreferences.v1`. They are written when the visitor saves the onboarding or profile form, never sent to FastAPI, and cleared on logout or using **Clear preferences**. No free-text allergy information is collected; visitors may only choose fish to avoid and are shown the medical disclaimer. UI route guards only guide the demo flow; they are not authentication.

Prices, savings, fares, and coordinates are never computed or invented in the frontend. Source labels identify the origin of each displayed number. When the API reports demo data, the site prominently warns that its fish prices are synthetic examples.

## Design

The interface uses the tokens in `src/styles.css`: a restrained Apple-style system type stack, an 8px spacing scale, accessible focus states, source-label capsules, and light/dark color tokens. Add pages with the established `PageHeader`, `.card`, `.notice`, `.tiles`, and button patterns rather than raw colors or ad hoc spacing.
