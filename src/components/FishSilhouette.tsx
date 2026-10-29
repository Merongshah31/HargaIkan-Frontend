/**
 * Static line-art fish.
 *
 * Used while the Three.js scene is loading and whenever WebGL is unavailable, so the hero
 * always paints something. Purely decorative: it is hidden from assistive technology and
 * carries no numbers.
 */
export function FishSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className ? `home-fish ${className}` : "home-fish"}
      viewBox="0 0 520 360"
      fill="none"
      role="presentation"
      focusable="false"
    >
      <defs>
        <linearGradient id="fish-body-fill" x1="80" y1="90" x2="430" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#64d2ff" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="fish-fin-fill" x1="160" y1="45" x2="310" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="fish-stroke-main" x1="36" y1="180" x2="456" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#e0f2fe" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="fish-stroke-rib" x1="120" y1="96" x2="390" y2="264" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="fish-core-glow" cx="62%" cy="48%" r="46%">
          <stop offset="0%" stopColor="#64d2ff" stopOpacity="0.26" />
          <stop offset="65%" stopColor="#0284c7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient hydro-luminescence behind the silhouette */}
      <ellipse cx="286" cy="180" rx="176" ry="88" fill="url(#fish-core-glow)" />

      {/* Swept forked caudal fin (tail) */}
      <path
        className="fish-fin"
        d="M128 180 C102 156, 68 120, 38 96 C54 132, 68 158, 76 180 C68 202, 54 228, 38 264 C68 240, 102 204, 128 180 Z"
        fill="url(#fish-fin-fill)"
        stroke="url(#fish-stroke-main)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Caudal fin rays */}
      <path
        className="fish-detail"
        d="M120 175 L54 116 M116 178 L64 144 M116 182 L64 216 M120 185 L54 244"
        stroke="url(#fish-stroke-rib)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Dorsal hydrofoil fin & rays */}
      <path
        className="fish-fin"
        d="M212 112 C232 74, 272 54, 326 60 C306 80, 296 96, 294 106"
        fill="url(#fish-fin-fill)"
        stroke="url(#fish-stroke-main)"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="fish-detail"
        d="M234 108 L258 68 M256 105 L284 64 M276 105 L304 64"
        stroke="url(#fish-stroke-rib)"
        strokeWidth="1.05"
        strokeLinecap="round"
      />

      {/* Ventral pelvic & anal fins */}
      <path
        className="fish-fin"
        d="M198 244 C214 274, 244 292, 282 288 C268 272, 260 260, 258 250"
        fill="url(#fish-fin-fill)"
        stroke="url(#fish-stroke-main)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="fish-detail"
        d="M218 247 L238 278 M238 249 L260 282"
        stroke="url(#fish-stroke-rib)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Main hydrodynamic fuselage */}
      <path
        className="fish-outline"
        d="M124 180 C166 124, 238 96, 318 104 C378 110, 424 140, 452 180 C424 220, 378 250, 318 256 C238 264, 166 236, 124 180 Z"
        fill="url(#fish-body-fill)"
        stroke="url(#fish-stroke-main)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Longitudinal harmonic contour lines */}
      <path
        className="fish-detail"
        d="M134 180 C216 176, 326 176, 444 180"
        stroke="url(#fish-stroke-main)"
        strokeWidth="1.25"
        strokeDasharray="3 5"
      />
      <path
        className="fish-detail"
        d="M154 156 C224 122, 316 118, 412 152"
        stroke="url(#fish-stroke-rib)"
        strokeWidth="1.2"
      />
      <path
        className="fish-detail"
        d="M154 204 C224 238, 316 242, 412 208"
        stroke="url(#fish-stroke-rib)"
        strokeWidth="1.2"
      />
      <path
        className="fish-detail"
        d="M186 136 C244 108, 318 108, 386 138"
        stroke="rgba(255, 255, 255, 0.38)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Precision anatomical cross-section ribs */}
      <path
        className="fish-detail"
        d="M178 142 C192 166, 192 194, 178 218 M218 122 C236 160, 236 200, 218 238 M262 108 C282 156, 282 204, 262 252 M308 106 C326 154, 326 206, 308 254 M352 114 C366 156, 366 204, 352 246"
        stroke="url(#fish-stroke-rib)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />

      {/* Gill operculum curve & articulated pectoral fin */}
      <path
        className="fish-detail"
        d="M378 128 C360 162, 360 198, 378 232"
        stroke="url(#fish-stroke-main)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        className="fish-fin"
        d="M362 188 C336 196, 308 214, 296 234 C322 232, 348 218, 364 198 Z"
        fill="url(#fish-fin-fill)"
        stroke="url(#fish-stroke-main)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Precision optical eye assembly */}
      <circle cx="404" cy="164" r="9.5" stroke="url(#fish-stroke-main)" strokeWidth="1.5" fill="rgba(8, 22, 38, 0.7)" />
      <circle className="fish-eye" cx="404" cy="164" r="4.5" fill="#e0f2fe" />
      <circle cx="406" cy="162.5" r="1.6" fill="#ffffff" />

      {/* Subtle jaw contour */}
      <path
        className="fish-detail"
        d="M446 186 C432 194, 416 196, 402 194"
        stroke="url(#fish-stroke-rib)"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}
