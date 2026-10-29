# HargaIkan frontend
Website: https://hargaikan.hargaikan.workers.dev

React 18 + TypeScript + Vite 6 interface for the FastAPI backend in `../backend`, built as an installable PWA (see **Install as an app**). The homepage is public and links to the fish finder, forecast and travel calculator. The dashboard is behind a short first-run flow: **sign in → preferences → dashboard**. Preferences are saved locally in the browser.

## Local development

Run the backend first from `../backend`. Copy `.env.example` to `.env` if you need to set `VITE_API_BASE_URL` to a different backend origin, then start the frontend:

```powershell
npm install
Copy-Item .env.example .env
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run build      # typecheck + Vite build to dist/
```

The browser calls `${VITE_API_BASE_URL}/api/v1` when the variable is set. Use an origin such as `http://127.0.0.1:8000`, without `/api/v1`. If unset, requests use relative `/api/v1` and the Vite development proxy or Vercel rewrite. The API URL is public configuration; never put Supabase or other secrets in `VITE_` variables.

If port 8000 is already serving the API, use that process. Check `http://127.0.0.1:8000/api/v1/health` before starting a second one. If you need another port, start Uvicorn on `8001` and set the local frontend `.env` to `VITE_API_BASE_URL=http://127.0.0.1:8001`, then restart Vite.

**"The HargaIkan server cannot be reached right now."** Two different failures show that message. Open DevTools → Console: `net::ERR_CONNECTION_REFUSED` means nothing is listening (start the backend), while `No 'Access-Control-Allow-Origin' header is present` / `net::ERR_FAILED` means the backend is up but refuses this page's origin — expected when `VITE_API_BASE_URL` points straight at the API instead of going through the Vite proxy. Vite picks the next free port (`5174`, `5175`, …) when `5173` is taken, and a backend running with `APP_ENV=development` accepts any `localhost`/`127.0.0.1` port for exactly that reason. Any other `APP_ENV` needs this origin in the backend's `CORS_ORIGINS`. Clearing `VITE_API_BASE_URL` in `.env` sends requests through the Vite proxy instead, which has no CORS step at all.

**Price data:** The frontend requests published records from the backend. Configure Supabase and import actual historical references as described in the backend README. PriceCatcher ingestion is not implemented yet.

## Install as an app (PWA)

The build is installable: `vite-plugin-pwa` (see `vite.config.ts`) emits `dist/manifest.webmanifest`, `dist/sw.js` and `dist/registerSW.js`, and `registerSW.js` is injected into `index.html`. Nothing in `src/` imports the virtual service-worker module, so the vitest setup never sees a service worker. Open the deployed site in Chrome or Edge and use the install control in the address bar, on Android the **Install app** menu entry, or on iOS Safari **Share → Add to Home Screen**.

The service worker precaches **the app shell only** — HTML, JS, CSS chunks and the icons — and adds one runtime cache for map imagery (`tile.openstreetmap.org`, CacheFirst, 600 tiles, 30 days).

- API responses are **not** cached, on purpose. A price, forecast or recommendation served from the cache would appear without the period it was published for, which is exactly what the source labels in the interface exist to prevent. When the connection drops, the shell still opens, the sections report that data is unavailable, and `.offline-banner` says why.
- `registerType: "autoUpdate"` means a new deployment takes over on the next visit without a manual cache clear. Do not switch it to `prompt` unless you also add update UI.
- `npm run dev` deliberately does not register a service worker (plugin `devOptions` default), so a stale cache can never fight the dev server. Test installability with `npm run build && npm run preview`, or against the deployed site over HTTPS (`localhost` is treated as secure).
- The `vercel.json` rewrite and Cloudflare Pages both serve existing files before falling back to `index.html`, so `/sw.js` and `/manifest.webmanifest` are not swallowed by the SPA rewrite. Keep it that way if you change hosts: a `sw.js` that answers with HTML breaks registration.
- Icons live in `public/`: `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` (transparent, rounded), `maskable-icon-512x512.png` (full-bleed background, artwork inside the 80% safe zone), `apple-touch-icon-180x180.png` and `favicon.ico`. They are all derived from `public/favicon.svg`; if you redraw the logo, regenerate them (render the SVG at 512×512 and downscale, or run `npx @vite-pwa/assets-generator --preset minimal-2023 public/favicon.svg`) and keep the filenames, sizes and `manifest.icons` entries in sync.

## First-run flow

| Route | Who can open it | Screen |
| --- | --- | --- |
| `/` | everyone | Homepage with the public tools; header shows **Log in** |
| `/cari`, `/ramalan`, `/perjalanan` | everyone | Fish finder, forecast and travel calculator |
| `/login` | everyone | Sign-in step: a name, nothing else |
| `/profil` | everyone | Five preference questions (**Save and continue to dashboard** during the first run) |
| `/dashboard` | signed in with preferences saved | Overview and market watch |
| `/onboarding` | redirect | Legacy URL, kept as a redirect to `/profil` |

`/dashboard` is the only guarded route. `src/session/RequireSession.tsx` sends a visitor without a session to `/login`, and a visitor who has signed in but has not saved the preferences step to `/profil`.

There is no account, password, token or server session: `src/session/SessionProvider.tsx` keeps `{ name, onboardingComplete }` in `sessionStorage` under `hargaikan.session.v1`, so it clears when the tab closes and nothing is sent to FastAPI. **Sign out** in the header clears it. Avoid storing anything sensitive here — the header shows the chosen name, and the sign-in form deliberately clears the device preferences so a new visitor does not inherit the previous visitor's profile.

## Dashboard sections

The dashboard is built only from published data; nothing on it extrapolates a price.

| Section | Source | Rule |
| --- | --- | --- |
| Market watch | `/overview` + `/prices/reference` weekly points | The triangle compares the **last two published weeks** (`trendFor`). Red ▲ = the latest week is higher, green ▼ = lower, `▬` = within 0.05%. The percentage and the words `rising/falling vs last week` are always printed, so colour is never the only signal. |
| Price warning icon | same points plus the band P75 | ⚠️ appears only when the latest week is **above the band P75** (`isHighPrice`); the reason is in the `title` and in screen-reader-only text. |
| **B. Weather & festivity alerts** | `GET /api/v1/alerts` | The backend supplies both: the Open-Meteo daily forecast for Kuala Lumpur reduced by HargaIkan's own thresholds (rain ≥ 10 mm, wind ≥ 50 km/h, ≥ 35 °C — see `backend/README.md`), and the maintained public-holiday calendar. Every alert is translated (`i18n.ts`, including the alert bodies, whose numbers come from the forecast) and prints its source: Open-Meteo is labelled a forecast, not an official MET Malaysia warning. A festival is dated `on` its day, a weather alert `until` the forecast day. No alert ever states a price. When a source cannot be read the section shows that notice and still lists the other source. |
| **C. Smart swaps for you** | `/prices/reference` + `/recommendations` for saved favourites, up to 2 | A swap appears only when a favourite's **latest week is above its band P75** (`priceLevel`). The alternative is the verified cheaper similar fish the API returns, with its median and saving; the "(High)" / "(Low)" labels come from the band, not from a guess. |

The market-watch sparkline was removed: it drew a line for every row without saying what it meant, and a short line cannot show a level. Section B and C live in `src/components/SmartAlerts.tsx` and `src/components/SmartSwaps.tsx`.

## Travel page (`/perjalanan`)

The car form keeps every cost a user input; the optional map only fills **One-way distance (km)**.

| Detail | Rule |
| --- | --- |
| Map | `src/components/TravelMap.tsx` on OpenStreetMap tiles (`src/travel/geo.ts` holds the tile URL, the ODbL attribution and `MAX_TILE_ZOOM`; `LocationMap` uses the same constants). No API key and no routing service. |
| Malaysia only | The view and `maxBounds` are clamped to `MALAYSIA_BOUNDS`, and a click outside it is refused with a notice instead of being snapped somewhere else. A box is not a border, so the code states its limit: it cannot separate Singapore from Johor Bahru. |
| Estimate | `estimatedRoadKm` = great-circle km (`haversineKm`) × `ROAD_FACTOR` 1.3, rounded to 0.1 km. Both numbers are printed (road + straight line), and **Use this distance** writes the estimate into the input, which the visitor can then edit. |
| Mockup data | `MOCK_PLACES` is thirteen hand-written Malaysian markets/towns. They are demo labels, not a premise directory, and the panel says so (`Mockup data: … not a routing service or a toll estimate`). No toll, fare, duration or price is derived from the map. |
| Unavailable | Device geolocation is never requested. A failed tile load says the tiles could not be loaded and asks for the distance to be typed. |

## Forecast page

`/ramalan` shows **every catalogue fish at once** as a heat map. There is no fish or location picker: the page loads the model snapshot once and the reference for each fish, then draws a tile per fish.

| Detail | Rule |
| --- | --- |
| Tiles | One per fish in `GET /api/v1/species`, matched to a row in `GET /api/v1/forecast/snapshot` by `normalizeFishName`. The model file writes `IKAN KEMBUNG (ANTARA 8 HINGGA 12 EKOR SEKILOGRAM)`, so the size notation in brackets is dropped before matching. A fish the file does not cover keeps its tile and says **No estimate**; nothing is invented. |
| Value | The model's own `value`, labelled **Model estimate**. The page never converts, projects or averages a price. |
| Percentage | `(estimate − published median) / published median`, where the median comes from `GET /api/v1/prices/reference` for the default location (Kuala Lumpur). It is the same kind of derived figure as the market-watch triangle, and both numbers are printed in the table and in each tile's `title`. |
| Colour | Three steps per direction (under 3%, 3–8%, 8% and above). Red = the model estimates **above** the published median (costlier), green = below, grey = no median to compare. Every tile also prints the signed percentage with an arrow and the legend states the direction in words, so colour is never the only signal. |
| Width | The published median price, so a cheaper fish gets a narrower tile; tiles with no median fall back to the estimate. Tiles are sorted from the largest rise to the largest fall. |
| Table | A `<details>` under the map repeats every number (estimate, median, change, target date) with its source label. |

All eleven reference calls leave together; each is retried once before its tile goes neutral, because a cold API otherwise leaves a fish grey. When the API has no catalogue (demo data) the model's own rows are drawn instead.

## Deployment

Set the Vercel project root directory to `frontend` and set `VITE_API_BASE_URL` to the deployed Render origin. Set the backend `CORS_ORIGINS` to the Vercel origin. `vercel.json` retains a same-origin API rewrite as a fallback and the SPA route fallback.

For **Cloudflare Pages**, use `npm run build` and output directory `dist`. This `frontend/` folder is itself a Git repository, so use its repository root as the Cloudflare root directory; use `frontend` only if you later publish the whole parent project as one repository. In **Settings → Variables and Secrets**, set the Production build variable `VITE_API_BASE_URL` to the public HTTPS backend origin, for example `https://your-api.example.com` (only after `/api/v1/health` returns JSON with `"status":"ok"`). Redeploy after changing it: Vite puts the value into the built JavaScript. Also include the exact Pages site origin in the backend's `CORS_ORIGINS`. The Pages build now rejects localhost, `127.0.0.1`, and missing API URLs.

### Local backend with a public Cloudflare Tunnel

If FastAPI is running only in a local CMD window, a public Cloudflare Pages site cannot call
`127.0.0.1`; that address belongs to each visitor's computer. Use two terminals:

1. Start the API and allow the deployed frontend origin:

   ```cmd
   cd C:\reactproject\HargaIkan\backend
   set APP_ENV=development
   set CORS_ORIGINS=https://hargaikan.hargaikan.workers.dev
   D:\hargaikan-venv\Scripts\python.exe -m uvicorn hargaikan.api.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. In a second terminal, expose port 8000:

   ```cmd
   cloudflared tunnel --url http://127.0.0.1:8000
   ```

   Keep this terminal open. Copy the generated `https://...trycloudflare.com` URL and verify
   `<tunnel-url>/api/v1/health` returns JSON.

3. In Cloudflare Pages → Settings → Variables and Secrets, set the production
   `VITE_API_BASE_URL` to that tunnel URL **without** `/api/v1`, then redeploy the frontend.

Quick Tunnel URLs change whenever `cloudflared` restarts. For a permanent URL, create a named
Cloudflare Tunnel and configure its hostname to forward to `http://127.0.0.1:8000`; use that
stable HTTPS hostname as `VITE_API_BASE_URL` instead.

All Supabase keys and Render secrets stay under `../backend`; none belong in this frontend repository or browser bundle.

## Privacy

Preferences use the versioned local browser key `hargaikan.guestPreferences.v1`. They are written when the visitor saves the preferences form, never sent to FastAPI, and cleared using **Clear preferences**. No free-text allergy information is collected; visitors may only choose fish to avoid and are shown the medical disclaimer. The sign-in step is a device-only name (`hargaikan.session.v1`, see **First-run flow**): there is no account, password or authentication token anywhere in the frontend. The installed app's service worker keeps only the shell and map tiles in the browser cache (see **Install as an app**); no price, forecast or preference response is stored there.

Fish prices and savings are never computed or invented in the frontend. Source labels identify the origin of displayed values; the travel calculator uses only user-supplied inputs and maintained fare entries from the API. When the API marks price records, recommendations, forecasts or market-watch figures as synthetic, the frontend hides those figures rather than presenting them as published prices. The backend must still enforce provenance before publishing real data.

## Design

The interface uses the tokens in `src/styles.css`: a restrained system type stack, an 8px spacing scale, accessible focus states, source-label capsules, and light/dark color tokens. The homepage has an illustrated editorial hero; other pages use the established `PageHeader`, `.card`, `.notice`, `.tiles`, and button patterns.

The hero fish in `src/components/HomeFishScene.tsx` is animated with Three.js using an orthographic camera, so it stays a flat line-art illustration. Two details matter when editing it:

- `three` is imported dynamically, so it stays in a separate chunk and is only downloaded on the homepage. Do not convert that import to a static one.
- The component is decorative and never prints a price. It paints `FishSilhouette` (SVG) first, swaps in the canvas after the first frame, and keeps the SVG when WebGL is unavailable, and it renders a single static frame under `prefers-reduced-motion`.

The scene keeps itself cheap: it pauses the render loop while scrolled out of view or while the tab is hidden, caps the pixel ratio at 2, and disposes every geometry, material and the WebGL context on unmount.

The Fish finder map in `src/components/LocationMap.tsx` is plain Leaflet + react-leaflet drawing **OpenStreetMap's own tiles** (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, no API key, no `{s}` subdomains, max zoom 19). Two rules apply:

- Keep the `© OpenStreetMap contributors` attribution visible. The ODbL licence requires it, and hiding it also violates OSM's tile usage policy. If you change `TILES`, change `ATTRIBUTION` with it.
- OSM publishes light tiles only, so dark mode inverts the tile pane with a CSS filter (`.map-dark .leaflet-tile-pane` in `styles.css`); markers, tooltips and the zoom control sit in other Leaflet panes and keep their own colours. If a tile request fails, the component prints a short notice pointing at the location list instead of leaving a blank square.

The public `tile.openstreetmap.org` server is intended for light use and is fine at this traffic level. If usage grows, point `TILES` at a paid or self-hosted provider (or a CARTO/MapTiler endpoint with a key) rather than adding load to OpenStreetMap's servers.
