import type { SourceLabelText } from "./api/types";

export type Language = "en" | "ms";
export const LANGUAGE_STORAGE_KEY = "hargaikan.language.v1";

export const SECTION_UNAVAILABLE = "This section is unavailable right now.";
export const NETWORK_ERROR = "The HargaIkan server cannot be reached right now. Please try again shortly.";
export const RECOMMENDATION_DISCLAIMER =
  "These recommendations are not medical advice. If you have food allergies, check the species name, product label, and cross-contamination risk with the seller or a healthcare professional.";
export const WARNING_ICON = "⚠️";
export const INFO_ICON = "ℹ️";
export const LOADING = "Loading…";

// Forecast page: a heat map of every fish, no picker. The copy keeps the provenance of the model file.
export const FORECAST = {
  title: "Forecast for every fish",
  lead:
    "Every fish from the supplied model as one tile: the width follows the published median price, the colour and the percentage show the model estimate against it. Nothing to search for or select.",
  compareTo: "Change is measured against the published median in",
  caption: "Model forecast and published median for every fish",
  fish: "Fish",
  estimate: "Model estimate",
  median: "Published median",
  change: "Change",
  targetDate: "Target date",
  source: "Source",
  missing: "No estimate",
  noReference: "no median",
  againstMedian: "against a published median of",
  legendAbove: "Above the median: the model estimates a higher price",
  legendBelow: "Below the median: the model estimates a lower price",
  legendNone: "No published median to compare",
  tableToggle: "View these numbers as a table",
  fileNote:
    "Values come from a supplied model file. The file does not identify a location or unit, so read each one as a national estimate for its target date.",
  modelStats: (model: string, mae: string, baselineMae: string, records: number) =>
    `Model ${model}: MAE ${mae} against a baseline of ${baselineMae} over ${records} test records.`,
} as const;

// Shown by the installed app while the browser reports no network connection.
export const OFFLINE_NOTICE =
  "You are offline. Pages you have already opened stay available, but new prices, forecasts and searches need a connection.";
// TEMPORARY design-preview banner copy; remove with src/preview (see src/preview/data.ts).
export const PREVIEW_RIBBON =
  "Design preview · the numbers on these screens are hardcoded placeholders, not published price records.";

export const SOURCE_LABELS: Record<SourceLabelText, string> = {
  "Harga sejarah": "Historical price",
  "Input pengguna": "Your input",
  "Anggaran model": "Model estimate",
  "Anggaran perjalanan": "Travel estimate",
  "Jadual tambang": "Fare table",
};

export const SOURCE_LABELS_MS: Record<SourceLabelText, string> = {
  "Harga sejarah": "Harga sejarah",
  "Input pengguna": "Input pengguna",
  "Anggaran model": "Anggaran model",
  "Anggaran perjalanan": "Anggaran perjalanan",
  "Jadual tambang": "Jadual tambang",
};

export const SOURCE_ICONS: Record<SourceLabelText, string> = {
  "Harga sejarah": "📊",
  "Input pengguna": "✍️",
  "Anggaran model": "📈",
  "Anggaran perjalanan": "🚗",
  "Jadual tambang": "🎫",
};

export const SOURCE_DESCRIPTIONS: Record<SourceLabelText, string> = {
  "Harga sejarah": "Calculated from published price records.",
  "Input pengguna": "A value you entered.",
  "Anggaran model": "An estimate from a tested forecast model; estimates are uncertain.",
  "Anggaran perjalanan": "Travel cost calculated only from information you entered.",
  "Jadual tambang": "A maintained public-transit fare table.",
};

export const LEVEL_LABELS: Record<string, string> = {
  nasional: "National",
  negeri: "State",
  kawasan: "Area",
  pasar: "Market",
  premis: "Premise",
};

export const CONFIDENCE_LABELS: Record<string, string> = {
  rendah: "Low",
  sederhana: "Moderate",
  tinggi: "High",
};

export const BRAND = "HargaIkan";
export const EYEBROW = "HARGAIKAN / MARKET INTELLIGENCE";
export const SKIP_LINK = "Skip to main content";
export const NAV_LABEL = "Primary navigation";
export const HEADER_ACTION = "Explore prices";
export const NAV_LABELS = {
  home: "Home",
  dashboard: "Dashboard",
  cari: "Fish finder",
  profil: "Preferences",
  ramalan: "Forecast",
  perjalanan: "Travel",
} as const;
export const LEGEND_TITLE = "Price source labels";
export const FOOTER_NOTE =
  "Every number is shown with its source label. HargaIkan never requests your device location.";
export const SOURCE_SHORT_DESCRIPTIONS: Record<SourceLabelText, string> = {
  "Harga sejarah": "published price records",
  "Input pengguna": "a value you entered",
  "Anggaran model": "an uncertain model forecast",
  "Anggaran perjalanan": "calculated from your inputs",
  "Jadual tambang": "a public-transit fare table",
};

export const PAGES = {
  home: {
    title: "Know the price. Buy with confidence.",
    lead: "Explore historical fish price references across Kuala Lumpur, compare a seller’s quote, and see what your journey really costs.",
  },
  dashboard: {
    title: "Know your fish price.",
    lead: "Compare historical references across Kuala Lumpur before you buy.",
  },
  cari: {
    title: "Fish finder",
    lead: "Search by Malay, English or scientific fish name.",
  },
  profil: {
    title: "Your fish preferences",
    lead: "Answer a few questions to make your next fish search easier.",
  },
  ramalan: {
    title: "Price forecast",
    lead: "One tested model, one list: the next estimate for every fish in the catalogue.",
  },
  perjalanan: {
    title: "Travel cost",
    lead: "Estimate travel from details you enter. HargaIkan never requests your device location.",
  },
  notFound: {
    title: "Page not found",
    lead: "The page you requested does not exist or has moved.",
  },
  login: {
    title: "Sign in to HargaIkan",
    lead: "Tell us what to call you, then set your fish preferences. No account, no password, no token.",
  },
} as const;

export const HOME = {
  startAction: "Explore fish prices",
  travelAction: "Plan your trip",
  heroNote: "Historical references, not real-time market quotes. Availability depends on published records.",
  specChips: ["P25–P75 Quartile Bands", "Source-Labelled Data", "Zero Location Tracking"],
  visualTop: "KUALA LUMPUR  /  FISH PRICE REFERENCES",
  visualBottom: "A CLEARER WAY TO COMPARE",
  sectionEyebrow: "THE TOOLS",
  howItWorks: "A smarter way to shop for fish.",
  sectionLead: "From the price at the counter to the cost of getting there, make every ringgit count.",
  stepLabel: "EXPLORE",
  compareBadge: "Price Benchmark",
  compareTitle: "Compare the price.",
  compareText: "Check a seller’s quote against a published historical price range for your fish and location.",
  compareLink: "Check a price",
  findBadge: "Catalog & Swaps",
  findTitle: "Find your next fish.",
  findText: "Explore the fish catalog and verified alternatives when records are available.",
  findLink: "Explore market watch",
  travelBadge: "Trip Calculator",
  travelTitle: "See the whole cost.",
  travelText: "Add your own travel details to see the cost of your trip alongside the cost of fish.",
  travelLink: "Estimate travel",
  promiseEyebrow: "OUR PROMISE",
  promiseTitle: "No guesswork. Just context.",
  promiseText: "We show prices only when published records are available. Estimates and your own inputs are clearly labelled, so you know where every number comes from.",
  pillars: [
    { icon: "📊", title: "Published Records", desc: "Aggregated historical market ranges" },
    { icon: "✍️", title: "Your Own Inputs", desc: "Quotes & trip details stay explicit" },
    { icon: "📈", title: "Tested Estimates", desc: "Shown with model error context" },
    { icon: "🔒", title: "Device-First Privacy", desc: "Never requests GPS location" },
  ],
} as const;

export const PRICE_DATA_UNAVAILABLE = "Published fish price records are not available yet. Price comparisons will appear when records have been added.";

export const DASHBOARD = {
  findFish: "Find a fish",
  setPreferences: "Set your preferences",
  savedOnDevice: "Your preferences are saved on this device.",
  startingPointTitle: "Your starting point",
  editPreferences: "Edit preferences",
  favoriteFishLabel: "Favourite fish:",
  budgetLabel: "Usual budget:",
  locationLabel: "Usual shop:",
  loadingMarketWatch: "Loading market watch…",
  overviewAriaLabel: "Market overview",
  speciesCountLabel: "Fish species",
  premiseCountLabel: "Markets / premises",
  latestPeriodLabel: "Latest data period",
} as const;

export const LOGIN = {
  linkLabel: "Log in",
  nameLabel: "What should we call you?",
  namePlaceholder: "for example Aisyah",
  nameError: "Enter a name to continue.",
  continueAction: "Continue",
  sessionNote: "No account and no sign-in token. The name stays in this browser tab and is never sent to the server.",
  alreadyInTitle: "You are already signed in",
  signOutAction: "Sign out",
} as const;

export const PROFILE = {
  favoriteQuestion: "What fish do you buy most often?",
  budgetQuestion: "What is your usual budget?",
  budgetPlaceholder: "RM/kg, for example 30.00",
  budgetError: "Enter a budget greater than RM0 and no more than RM1000 per kg.",
  locationQuestion: "Where do you usually shop?",
  locationEmpty: "No preference",
  avoidQuestion: "Which fish would you like to avoid?",
  avoidNote: "Your choices are saved only in this browser. They are not medical advice.",
  cookingQuestion: "How do you usually cook fish?",
  cookingOptions: {
    none: "No preference",
    fried: "Fried",
    steamed: "Steamed",
    curry: "Curry",
    grilled: "Grilled",
    other: "Other",
  },
  saveAction: "Save preferences",
  saveAndContinueAction: "Save and continue to dashboard",
  onboardingNotice: "Two minutes of preferences, then your dashboard opens.",
  clearAction: "Clear preferences",
  clearConfirmation: "Clear your saved browser preferences?",
  cancelAction: "Cancel",
  confirmClearAction: "Clear",
  savedFeedback: "Preferences saved on this device.",
  clearedFeedback: "Saved browser preferences cleared.",
  deviceOnlyNote: "Saved on this device only. No account or database profile is created.",
} as const;

export const FISH_FINDER = {
  fishName: "Fish name",
  searchPlaceholder: "for example kembung",
  searchAction: "Search",
  searching: "Searching…",
  selectedFish: "Selected fish:",
  optionsTitle: "Location and seller price",
  noMapLocations: "No locations with coordinates are available for the map. Choose a location from the list.",
  mapTilesUnavailable:
    "The OpenStreetMap tiles could not be loaded. Pick a location from the list instead; it works the same way.",
  gradeLabel: "Grade (optional)",
  allGrades: "All grades",
  sellerPrice: "Seller price (RM/kg, optional)",
  sellerPricePlaceholder: "for example 12.50",
  checkPrice: "Check price",
  selectedTag: "selected",
} as const;

export const PICKERS = {
  location: "Location",
  fish: "Fish",
  chooseFish: "Choose a fish",
} as const;

export const HERO_CTA = "Find a fish";
export const TRAVEL_NO_GUESS = "HargaIkan does not guess distances, tolls, or fares.";
export const TRAVEL_MODE_LABELS = {
  kereta: "Car",
  pengangkutan_awam: "Public transport",
} as const;
export const BACK_TO_DASHBOARD = "Back to home";
export const CHART_MEDIAN_SERIES = "Weekly median";
export const CHART_IN_LOCATION = "in";
export const CHART_BAND = "P25–P75";
export const CHART_QUOTE = "Seller price";
export const CHART_TABLE_TOGGLE = "View chart data as a table";
export const CHART_TABLE_CAPTION = "Weekly median (historical price)";
export const CHART_COL_WEEK = "Week starting";
export const CHART_COL_MEDIAN = "Median";
export const CHART_COL_RECORDS = "Records";
export const CHART_BAND_RANGE = "P25–P75 range";
export const MARKET_WATCH = "Market watch";
export const LATEST_REFERENCES = "LATEST PRICE REFERENCES";
export const HISTORICAL_REFERENCE = "Historical reference";

export const TREND_UP = "rising vs last week";
export const TREND_DOWN = "falling vs last week";
export const TREND_FLAT = "steady vs last week";
export const TREND_UNKNOWN = "no recent movement";
export const HIGH_PRICE_FLAG = "Price is above the P75 of its recent range";
export const TREND_LEGEND = "Arrows compare the last two published weeks. Red is higher, green is lower.";

export const PRICE_LEVELS = {
  high: "High",
  low: "Low",
  typical: "Typical",
} as const;

export const ALERTS = {
  kicker: "SUPPLY ALERTS",
  title: "Weather & festivity alerts",
  lead: "Weather and the festival calendar move supply. HargaIkan only shows an alert when a source reports one.",
  empty: "No weather or festivity alerts apply to your saved markets right now.",
  kindLabels: { weather: "Weather", festivity: "Festivity" },
  onDate: "on",
  untilDate: "until",
} as const;

export const SWAPS = {
  kicker: "FROM YOUR PREFERENCES",
  title: "Smart swaps for you",
  lead: "When a fish you usually buy is priced high, these are cheaper fish verified as similar.",
  usuallyBuyPrefix: "You usually buy",
  butItIsAt: ", but it is at",
  inLocationPrefix: "in",
  expensive: "is at the high end of its recent range",
  tryPrefix: "Try",
  atWord: "at",
  saving: "Saving",
  linkLabel: "Compare in the fish finder",
  empty: "None of your favourite fish is priced high right now, so there is nothing to swap.",
  noPreferences: "Save a favourite fish in your preferences to see swap suggestions here.",
  unknownPrice: "Price is not available for this fish yet.",
} as const;

export const REFERENCE_CARD = {
  headingPrefix: "Price reference:",
  referenceLocation: "Reference location:",
  requestedPrefix: "requested:",
  medianPrice: "Median price",
  p25: "P25",
  p75: "P75",
  records: "Records",
  confidence: "Confidence",
  period: "Period",
  grade: "Grade",
  sellerPrice: "Seller price:",
} as const;

export const RECOMMENDATIONS_CARD = {
  title: "Cheaper similar fish",
  personalisedNote: "Recommendations are tailored to your profile (allergies and budget).",
  noRecommendationsFallback: "No recommendations",
  savingLabel: "Saving against original fish median",
  median: "Median",
  bandRange: "P25–P75 range",
  records: "Records",
  confidence: "Confidence",
  location: "Location",
  period: "Period",
  differences: "Differences:",
  overBudgetFallback: "Over budget",
} as const;

export const FORECAST_CARD = {
  headingPrefix: "Forecast:",
  inWord: "in",
  unavailableFallback: "Forecast unavailable.",
  estimatedMedian: "Estimated median",
  estimatedRange: "Estimated range (P10–P90)",
  forecastPeriod: "Forecast period",
  latestData: "Latest data",
  modelLocation: "Model location",
  modelVersion: "Model version",
  baselineSuffix: " · baseline",
  mae: "Mean absolute error (MAE)",
  sellerPrice: "Seller price:",
} as const;

export const TRAVEL_PAGE = {
  modeLegend: "Travel mode",
  carLegend: "Car",
  distanceLabel: "One-way distance (km)",
  efficiencyLabel: "Fuel efficiency (km/l)",
  fuelTypeLabel: "Fuel type",
  fuelPriceLabel: "Fuel price (RM/l)",
  tollLabel: "Tolls (RM)",
  parkingLabel: "Parking (RM)",
  publicTransportLegend: "Public transport",
  fareLabel: "One-way fare (RM)",
  fareHelp: "Or leave this blank and choose a transport type, origin, and destination to check the fare table.",
  transitTypeLabel: "Transport type",
  transitNotSelected: "Not selected",
  transitMonorail: "Monorail",
  transitBus: "Bus",
  originLabel: "Origin (station name)",
  destinationLabel: "Destination (station name)",
  roundTripLabel: "Round trip",
  fishLegend: "Fish",
  fishPriceLabel: "Fish price (RM/kg)",
  filledFromPrefix: "Filled from",
  qtyLabel: "Quantity (kg)",
  prefillSummary: "Fill fish price from the historical median",
  useMedianAction: "Use historical median",
  calculateAction: "Calculate estimate",
  resultHeading: "Cost estimate",
  notEstimatedFallback: "Travel cost has not been estimated yet",
  captionInputs: "Information entered",
  captionComponents: "Travel cost components",
  fareSourcePrefix: "Fare source:",
  captionSeparate: "Travel and fish costs (separate)",
  captionTotal: "Total",
  colItem: "Item",
  colValue: "Value",
  colSource: "Source",
  medianNotePrefix: "median",
} as const;

export const EN_MESSAGES = {
  langSwitchLabel: "Language",
  sectionUnavailable: SECTION_UNAVAILABLE,
  networkError: NETWORK_ERROR,
  recommendationDisclaimer: RECOMMENDATION_DISCLAIMER,
  loading: LOADING,
  offlineNotice: OFFLINE_NOTICE,
  previewRibbon: PREVIEW_RIBBON,
  sourceLabels: SOURCE_LABELS,
  sourceDescriptions: SOURCE_DESCRIPTIONS,
  sourceShortDescriptions: SOURCE_SHORT_DESCRIPTIONS,
  levelLabels: LEVEL_LABELS,
  confidenceLabels: CONFIDENCE_LABELS,
  brand: BRAND,
  eyebrow: EYEBROW,
  skipLink: SKIP_LINK,
  navLabel: NAV_LABEL,
  headerAction: HEADER_ACTION,
  navLabels: NAV_LABELS,
  legendTitle: LEGEND_TITLE,
  footerNote: FOOTER_NOTE,
  pages: PAGES,
  home: HOME,
  priceDataUnavailable: PRICE_DATA_UNAVAILABLE,
  dashboard: DASHBOARD,
  login: LOGIN,
  profile: PROFILE,
  fishFinder: FISH_FINDER,
  pickers: PICKERS,
  heroCta: HERO_CTA,
  travelNoGuess: TRAVEL_NO_GUESS,
  travelModeLabels: TRAVEL_MODE_LABELS,
  backToDashboard: BACK_TO_DASHBOARD,
  chartMedianSeries: CHART_MEDIAN_SERIES,
  chartInLocation: CHART_IN_LOCATION,
  chartBand: CHART_BAND,
  chartQuote: CHART_QUOTE,
  chartTableToggle: CHART_TABLE_TOGGLE,
  chartTableCaption: CHART_TABLE_CAPTION,
  chartColWeek: CHART_COL_WEEK,
  chartColMedian: CHART_COL_MEDIAN,
  chartColRecords: CHART_COL_RECORDS,
  chartBandRange: CHART_BAND_RANGE,
  marketWatch: MARKET_WATCH,
  latestReferences: LATEST_REFERENCES,
  historicalReference: HISTORICAL_REFERENCE,
  trendUp: TREND_UP,
  trendDown: TREND_DOWN,
  trendFlat: TREND_FLAT,
  trendUnknown: TREND_UNKNOWN,
  highPriceFlag: HIGH_PRICE_FLAG,
  trendLegend: TREND_LEGEND,
  priceLevels: PRICE_LEVELS,
  alerts: ALERTS,
  swaps: SWAPS,
  forecast: FORECAST,
  referenceCard: REFERENCE_CARD,
  recommendationsCard: RECOMMENDATIONS_CARD,
  forecastCard: FORECAST_CARD,
  travel: TRAVEL_PAGE,
};

type Widen<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T extends string
        ? string
        : T;

export type AppMessages = Widen<typeof EN_MESSAGES>;

export const MS_MESSAGES: AppMessages = {
  langSwitchLabel: "Bahasa",
  sectionUnavailable: "Bahagian ini tidak dapat dimuatkan buat masa ini.",
  networkError: "Pelayan HargaIkan tidak dapat dihubungi sekarang. Sila cuba sebentar lagi.",
  recommendationDisclaimer:
    "Cadangan ini bukan nasihat perubatan. Jika anda mempunyai alergi makanan, semak nama spesies, label produk dan risiko pencemaran silang dengan penjual atau profesional kesihatan.",
  loading: "Memuatkan…",
  offlineNotice:
    "Anda sedang luar talian. Halaman yang telah dibuka kekal tersedia, tetapi harga baharu, ramalan dan carian memerlukan sambungan internet.",
  previewRibbon:
    "Pratonton reka bentuk · nombor pada skrin ini ialah pemegang tempat tetap, bukan rekod harga diterbitkan.",
  sourceLabels: SOURCE_LABELS_MS,
  sourceDescriptions: {
    "Harga sejarah": "Dikira daripada rekod harga diterbitkan.",
    "Input pengguna": "Nilai yang anda masukkan.",
    "Anggaran model": "Anggaran daripada model ramalan teruji; anggaran mempunyai ketidakpastian.",
    "Anggaran perjalanan": "Kos perjalanan dikira hanya daripada maklumat yang anda masukkan.",
    "Jadual tambang": "Jadual tambang pengangkutan awam yang diselenggara.",
  },
  sourceShortDescriptions: {
    "Harga sejarah": "rekod harga diterbitkan",
    "Input pengguna": "nilai yang anda masukkan",
    "Anggaran model": "ramalan model yang mempunyai ketidakpastian",
    "Anggaran perjalanan": "dikira daripada input anda",
    "Jadual tambang": "jadual tambang pengangkutan awam",
  },
  levelLabels: {
    nasional: "Nasional",
    negeri: "Negeri",
    kawasan: "Kawasan",
    pasar: "Pasar",
    premis: "Premis",
  },
  confidenceLabels: {
    rendah: "Rendah",
    sederhana: "Sederhana",
    tinggi: "Tinggi",
  },
  brand: BRAND,
  eyebrow: "HARGAIKAN / MAKLUMAT PASARAN",
  skipLink: "Langkau ke kandungan utama",
  navLabel: "Navigasi utama",
  headerAction: "Teroka harga",
  navLabels: {
    home: "Utama",
    dashboard: "Papan pemuka",
    cari: "Cari ikan",
    profil: "Pilihan",
    ramalan: "Ramalan",
    perjalanan: "Perjalanan",
  },
  legendTitle: "Label sumber harga",
  footerNote:
    "Setiap nombor dipaparkan bersama label sumbernya. HargaIkan tidak pernah meminta lokasi peranti anda.",
  pages: {
    home: {
      title: "Ketahui harga. Beli dengan yakin.",
      lead: "Teroka rujukan harga ikan sejarah di seluruh Kuala Lumpur, bandingkan sebut harga penjual, dan lihat kos sebenar perjalanan anda.",
    },
    dashboard: {
      title: "Ketahui harga ikan anda.",
      lead: "Bandingkan rujukan sejarah di seluruh Kuala Lumpur sebelum anda membeli.",
    },
    cari: {
      title: "Cari ikan",
      lead: "Cari mengikut nama ikan Bahasa Melayu, Bahasa Inggeris atau saintifik.",
    },
    profil: {
      title: "Pilihan ikan anda",
      lead: "Jawab beberapa soalan untuk memudahkan carian ikan anda yang seterusnya.",
    },
    ramalan: {
      title: "Ramalan harga",
      lead: "Satu model teruji, satu senarai: anggaran seterusnya untuk setiap ikan dalam katalog.",
    },
    perjalanan: {
      title: "Kos perjalanan",
      lead: "Anggarkan perjalanan daripada butiran yang anda masukkan. HargaIkan tidak pernah meminta lokasi peranti anda.",
    },
    notFound: {
      title: "Halaman tidak ditemui",
      lead: "Halaman yang anda minta tidak wujud atau telah dialihkan.",
    },
    login: {
      title: "Log masuk ke HargaIkan",
      lead: "Beritahu kami nama panggilan anda, kemudian tetapkan pilihan ikan anda. Tiada akaun, tiada kata laluan, tiada token.",
    },
  },
  home: {
    startAction: "Teroka harga ikan",
    travelAction: "Rancang perjalanan",
    heroNote: "Rujukan sejarah, bukan sebut harga pasaran masa nyata. Ketersediaan bergantung pada rekod diterbitkan.",
    specChips: ["Julat Kuartil P25–P75", "Data Berlabel Sumber", "Tiada Penjejakan Lokasi"],
    visualTop: "KUALA LUMPUR  /  RUJUKAN HARGA IKAN",
    visualBottom: "CARA LEBIH JELAS UNTUK MEMBANDING",
    sectionEyebrow: "ALATAN KAMI",
    howItWorks: "Cara lebih bijak membeli ikan.",
    sectionLead: "Daripada harga di kaunter hingga kos perjalanan ke sana, pastikan setiap ringgit berbaloi.",
    stepLabel: "TEROKA",
    compareBadge: "Penanda Aras Harga",
    compareTitle: "Bandingkan harga.",
    compareText: "Semak sebut harga penjual berbanding julat harga sejarah diterbitkan bagi ikan dan lokasi anda.",
    compareLink: "Semak harga",
    findBadge: "Katalog & Tukaran",
    findTitle: "Cari ikan seterusnya.",
    findText: "Teroka katalog ikan dan alternatif yang disahkan apabila rekod tersedia.",
    findLink: "Teroka pantauan pasaran",
    travelBadge: "Kalkulator Perjalanan",
    travelTitle: "Lihat keseluruhan kos.",
    travelText: "Tambah butiran perjalanan anda sendiri untuk melihat kos perjalanan bersama kos ikan.",
    travelLink: "Anggar perjalanan",
    promiseEyebrow: "JANJI KAMI",
    promiseTitle: "Tiada tekaan. Hanya konteks.",
    promiseText: "Kami memaparkan harga hanya apabila rekod diterbitkan tersedia. Anggaran dan input anda sendiri dilabel dengan jelas supaya anda tahu asal usul setiap nombor.",
    pillars: [
      { icon: "📊", title: "Rekod Diterbitkan", desc: "Julat pasaran sejarah terkumpul" },
      { icon: "✍️", title: "Input Anda Sendiri", desc: "Sebut harga & perjalanan kekal jelas" },
      { icon: "📈", title: "Anggaran Teruji", desc: "Dipaparkan bersama konteks ralat model" },
      { icon: "🔒", title: "Privasi Peranti Utama", desc: "Tidak pernah meminta lokasi GPS" },
    ],
  },
  priceDataUnavailable:
    "Rekod harga ikan diterbitkan belum tersedia. Perbandingan harga akan dipaparkan apabila rekod telah ditambah.",
  dashboard: {
    findFish: "Cari ikan",
    setPreferences: "Tetapkan pilihan anda",
    savedOnDevice: "Pilihan anda disimpan pada peranti ini.",
    startingPointTitle: "Titik permulaan anda",
    editPreferences: "Ubah pilihan",
    favoriteFishLabel: "Ikan kegemaran:",
    budgetLabel: "Bajet biasa:",
    locationLabel: "Tempat membeli biasa:",
    loadingMarketWatch: "Memuatkan pantauan pasaran…",
    overviewAriaLabel: "Ringkasan pasaran",
    speciesCountLabel: "Spesies ikan",
    premiseCountLabel: "Pasar / premis",
    latestPeriodLabel: "Tempoh data terkini",
  },
  login: {
    linkLabel: "Log masuk",
    nameLabel: "Apakah nama panggilan anda?",
    namePlaceholder: "contohnya Aisyah",
    nameError: "Masukkan nama untuk meneruskan.",
    continueAction: "Teruskan",
    sessionNote: "Tiada akaun dan tiada token log masuk. Nama ini kekal dalam tab pelayar ini dan tidak pernah dihantar ke pelayan.",
    alreadyInTitle: "Anda telah log masuk",
    signOutAction: "Log keluar",
  },
  profile: {
    favoriteQuestion: "Ikan apakah yang paling kerap anda beli?",
    budgetQuestion: "Berapakah bajet biasa anda?",
    budgetPlaceholder: "RM/kg, contohnya 30.00",
    budgetError: "Masukkan bajet melebihi RM0 dan tidak melebihi RM1000 setiap kg.",
    locationQuestion: "Di manakah anda biasa membeli ikan?",
    locationEmpty: "Tiada pilihan",
    avoidQuestion: "Ikan manakah yang ingin anda elakkan?",
    avoidNote: "Pilihan anda disimpan hanya dalam pelayar ini. Ia bukan nasihat perubatan.",
    cookingQuestion: "Bagaimanakah anda biasa memasak ikan?",
    cookingOptions: {
      none: "Tiada pilihan",
      fried: "Goreng",
      steamed: "Kukus",
      curry: "Kari / Gulai",
      grilled: "Bakar / Panggang",
      other: "Lain-lain",
    },
    saveAction: "Simpan pilihan",
    saveAndContinueAction: "Simpan dan teruskan ke papan pemuka",
    onboardingNotice: "Dua minit untuk menetapkan pilihan, kemudian papan pemuka anda akan dibuka.",
    clearAction: "Padam pilihan",
    clearConfirmation: "Padam pilihan pelayar anda yang disimpan?",
    cancelAction: "Batal",
    confirmClearAction: "Padam",
    savedFeedback: "Pilihan disimpan pada peranti ini.",
    clearedFeedback: "Pilihan pelayar yang disimpan telah dipadam.",
    deviceOnlyNote: "Disimpan pada peranti ini sahaja. Tiada akaun atau profil pangkalan data dicipta.",
  },
  fishFinder: {
    fishName: "Nama ikan",
    searchPlaceholder: "contohnya kembung",
    searchAction: "Cari",
    searching: "Mencari…",
    selectedFish: "Ikan dipilih:",
    optionsTitle: "Lokasi dan harga penjual",
    noMapLocations: "Tiada lokasi dengan koordinat tersedia untuk peta. Pilih lokasi daripada senarai.",
    mapTilesUnavailable:
      "Jubin peta OpenStreetMap tidak dapat dimuatkan. Pilih lokasi daripada senarai; ia berfungsi dengan cara yang sama.",
    gradeLabel: "Gred (pilihan)",
    allGrades: "Semua gred",
    sellerPrice: "Harga penjual (RM/kg, pilihan)",
    sellerPricePlaceholder: "contohnya 12.50",
    checkPrice: "Semak harga",
    selectedTag: "dipilih",
  },
  pickers: {
    location: "Lokasi",
    fish: "Ikan",
    chooseFish: "Pilih ikan",
  },
  heroCta: "Cari ikan",
  travelNoGuess: "HargaIkan tidak meneka jarak, tol atau tambang.",
  travelModeLabels: {
    kereta: "Kereta",
    pengangkutan_awam: "Pengangkutan awam",
  },
  backToDashboard: "Kembali ke halaman utama",
  chartMedianSeries: "Median mingguan",
  chartInLocation: "di",
  chartBand: "P25–P75",
  chartQuote: "Harga penjual",
  chartTableToggle: "Lihat data carta sebagai jadual",
  chartTableCaption: "Median mingguan (harga sejarah)",
  chartColWeek: "Minggu bermula",
  chartColMedian: "Median",
  chartColRecords: "Rekod",
  chartBandRange: "Julat P25–P75",
  marketWatch: "Pantauan pasaran",
  latestReferences: "RUJUKAN HARGA TERKINI",
  historicalReference: "Rujukan sejarah",
  trendUp: "meningkat berbanding minggu lepas",
  trendDown: "menurun berbanding minggu lepas",
  trendFlat: "stabil berbanding minggu lepas",
  trendUnknown: "tiada pergerakan terkini",
  highPriceFlag: "Harga melebihi P75 daripada julat terkininya",
  trendLegend: "Anak panah membandingkan dua minggu terakhir yang diterbitkan. Merah lebih tinggi, hijau lebih rendah.",
  priceLevels: {
    high: "Tinggi",
    low: "Rendah",
    typical: "Biasa",
  },
  alerts: {
    kicker: "AMARAN BEKALAN",
    title: "Amaran cuaca & perayaan",
    lead: "Cuaca dan kalendar perayaan mempengaruhi bekalan. HargaIkan hanya memaparkan amaran apabila sumber melaporkannya.",
    empty: "Tiada amaran cuaca atau perayaan bagi pasar simpanan anda buat masa ini.",
    kindLabels: { weather: "Cuaca", festivity: "Perayaan" },
    onDate: "pada",
    untilDate: "sehingga",
  },
  swaps: {
    kicker: "DARIPADA PILIHAN ANDA",
    title: "Tukaran bijak untuk anda",
    lead: "Apabila ikan yang biasa anda beli berharga tinggi, ini ialah ikan lebih murah yang disahkan serupa.",
    usuallyBuyPrefix: "Anda biasa membeli",
    butItIsAt: ", tetapi harganya",
    inLocationPrefix: "di",
    expensive: "berada pada paras tinggi dalam julat terkininya",
    tryPrefix: "Cuba",
    atWord: "pada",
    saving: "Jimat",
    linkLabel: "Bandingkan dalam pencari ikan",
    empty: "Tiada ikan kegemaran anda berharga tinggi sekarang, jadi tiada tukaran untuk dicadangkan.",
    noPreferences: "Simpan ikan kegemaran dalam pilihan anda untuk melihat cadangan tukaran di sini.",
    unknownPrice: "Harga bagi ikan ini belum tersedia.",
  },
  forecast: {
    title: "Ramalan untuk setiap ikan",
    lead:
      "Setiap ikan daripada model yang dibekalkan sebagai satu jubin: lebar mengikut harga median diterbitkan, warna dan peratusan menunjukkan anggaran model berbandingnya. Tiada apa yang perlu dicari atau dipilih.",
    compareTo: "Perubahan diukur berbanding median diterbitkan di",
    caption: "Ramalan model dan median diterbitkan untuk setiap ikan",
    fish: "Ikan",
    estimate: "Anggaran model",
    median: "Median diterbitkan",
    change: "Perubahan",
    targetDate: "Tarikh sasaran",
    source: "Sumber",
    missing: "Tiada anggaran",
    noReference: "tiada median",
    againstMedian: "berbanding median diterbitkan sebanyak",
    legendAbove: "Melebihi median: model menganggarkan harga lebih tinggi",
    legendBelow: "Di bawah median: model menganggarkan harga lebih rendah",
    legendNone: "Tiada median diterbitkan untuk dibandingkan",
    tableToggle: "Lihat nombor ini sebagai jadual",
    fileNote:
      "Nilai datang daripada fail model yang dibekalkan. Fail ini tidak menyatakan lokasi atau unit, jadi baca setiap nilai sebagai anggaran nasional bagi tarikh sasarannya.",
    modelStats: (model: string, mae: string, baselineMae: string, records: number) =>
      `Model ${model}: MAE ${mae} berbanding garis dasar ${baselineMae} daripada ${records} rekod ujian.`,
  },
  referenceCard: {
    headingPrefix: "Harga rujukan:",
    referenceLocation: "Lokasi rujukan:",
    requestedPrefix: "diminta:",
    medianPrice: "Harga median",
    p25: "P25",
    p75: "P75",
    records: "Rekod",
    confidence: "Keyakinan",
    period: "Tempoh",
    grade: "Gred",
    sellerPrice: "Harga penjual:",
  },
  recommendationsCard: {
    title: "Ikan serupa yang lebih murah",
    personalisedNote: "Cadangan disesuaikan mengikut profil anda (alergi dan bajet).",
    noRecommendationsFallback: "Tiada cadangan",
    savingLabel: "Penjimatan berbanding median ikan asal",
    median: "Median",
    bandRange: "Julat P25–P75",
    records: "Rekod",
    confidence: "Keyakinan",
    location: "Lokasi",
    period: "Tempoh",
    differences: "Perbezaan:",
    overBudgetFallback: "Melebihi bajet",
  },
  forecastCard: {
    headingPrefix: "Ramalan:",
    inWord: "di",
    unavailableFallback: "Ramalan belum tersedia.",
    estimatedMedian: "Median anggaran",
    estimatedRange: "Julat anggaran (P10–P90)",
    forecastPeriod: "Tempoh ramalan",
    latestData: "Data terkini",
    modelLocation: "Lokasi model",
    modelVersion: "Versi model",
    baselineSuffix: " · garis dasar",
    mae: "Ralat mutlak purata (MAE)",
    sellerPrice: "Harga penjual:",
  },
  travel: {
    modeLegend: "Mod perjalanan",
    carLegend: "Kereta",
    distanceLabel: "Jarak sehala (km)",
    efficiencyLabel: "Kecekapan bahan api (km/l)",
    fuelTypeLabel: "Jenis bahan api",
    fuelPriceLabel: "Harga bahan api (RM/l)",
    tollLabel: "Tol (RM)",
    parkingLabel: "Parkir (RM)",
    publicTransportLegend: "Pengangkutan awam",
    fareLabel: "Tambang sehala (RM)",
    fareHelp: "Atau biarkan kosong dan pilih jenis pengangkutan, stesen asal dan destinasi untuk menyemak jadual tambang.",
    transitTypeLabel: "Jenis pengangkutan",
    transitNotSelected: "Tidak dipilih",
    transitMonorail: "Monorel",
    transitBus: "Bas",
    originLabel: "Asal (nama stesen)",
    destinationLabel: "Destinasi (nama stesen)",
    roundTripLabel: "Perjalanan pergi balik",
    fishLegend: "Ikan",
    fishPriceLabel: "Harga ikan (RM/kg)",
    filledFromPrefix: "Diisi daripada",
    qtyLabel: "Kuantiti (kg)",
    prefillSummary: "Isi harga ikan daripada median sejarah",
    useMedianAction: "Guna median sejarah",
    calculateAction: "Kira anggaran",
    resultHeading: "Anggaran kos",
    notEstimatedFallback: "Kos perjalanan belum dianggarkan",
    captionInputs: "Maklumat dimasukkan",
    captionComponents: "Komponen kos perjalanan",
    fareSourcePrefix: "Sumber tambang:",
    captionSeparate: "Kos perjalanan dan ikan (berasingan)",
    captionTotal: "Jumlah",
    colItem: "Perkara",
    colValue: "Nilai",
    colSource: "Sumber",
    medianNotePrefix: "median",
  },
};

export const MESSAGES: Record<Language, AppMessages> = {
  en: EN_MESSAGES,
  ms: MS_MESSAGES,
};
