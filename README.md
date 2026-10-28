# HargaIkan frontend

Guest-first React 18 + TypeScript + Vite 6 interface for the FastAPI backend in `../backend`. The public home page is the main experience; visitors never create an account or sign in.

## Local development

Run the backend first from `../backend` in its local in-memory mode, then start the frontend:

```powershell
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run build      # typecheck + Vite build to dist/
```

The browser calls relative `/api/v1` URLs. Vite forwards `/api` to `http://127.0.0.1:8000` during development, so the frontend has no browser environment variables and no API secrets. The short comment-only `.env.example` exists only to make that explicit.

## Deployment

Set the Vercel project root directory to `frontend`. `vercel.json` first forwards `/api/:path*` to `https://hargaikan-api.onrender.com/api/:path*`, then applies the SPA fallback. If the deployed Render service uses a different hostname, rename that rewrite destination before deploying. This route is deployment configuration, not a browser environment variable.

All Supabase keys, Render secrets, and backend CORS configuration stay under `../backend`; none belong in this frontend repository or browser bundle.

## Privacy

Guest preferences use the versioned local browser key `hargaikan.guestPreferences.v1`. They are written only after the visitor chooses **Save preferences**, never sent to FastAPI, and can be removed using **Clear preferences**. No free-text allergy information is collected; visitors may only choose fish to avoid and are shown the medical disclaimer.

Prices, savings, fares, and coordinates are never computed or invented in the frontend. Source labels identify the origin of each displayed number, and no non-production data disclosure is shown in the UI.

## Design

The interface uses the tokens in `src/styles.css`: a restrained Apple-style system type stack, an 8px spacing scale, accessible focus states, source-label capsules, and light/dark color tokens. Add pages with the established `PageHeader`, `.card`, `.notice`, `.tiles`, and button patterns rather than raw colors or ad hoc spacing.
