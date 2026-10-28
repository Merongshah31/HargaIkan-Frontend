import type { SourceLabelText } from "./api/types";

export const SECTION_UNAVAILABLE = "This section is unavailable right now.";
export const NETWORK_ERROR = "The HargaIkan server cannot be reached right now. Please try again shortly.";
export const RECOMMENDATION_DISCLAIMER =
  "These recommendations are not medical advice. If you have food allergies, check the species name, product label, and cross-contamination risk with the seller or a healthcare professional.";
export const WARNING_ICON = "⚠️";
export const INFO_ICON = "ℹ️";
export const LOADING = "Loading…";

export const SOURCE_LABELS: Record<SourceLabelText, string> = {
  "Harga sejarah": "Historical price",
  "Input pengguna": "Your input",
  "Anggaran model": "Model estimate",
  "Anggaran perjalanan": "Travel estimate",
  "Jadual tambang": "Fare table",
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
export const NAV_LABELS = {
  home: "Home",
  dashboard: "Dashboard",
  cari: "Fish finder",
  profil: "Preferences",
  ramalan: "Forecast",
  perjalanan: "Travel",
} as const;
export const SESSION_NAV = { login: "Log in", logout: "Log out" } as const;
export const DEMO_DATA_NOTICE = "Demo data: fish prices are synthetic examples, not live market prices.";
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
    title: "Better fish decisions start here.",
    lead: "Explore historical fish prices across Kuala Lumpur, compare a seller’s quote, and plan the full cost of your trip.",
  },
  login: {
    title: "Welcome to HargaIkan.",
    lead: "Enter a name to try the hackathon demo. No account or password is needed.",
  },
  onboarding: {
    title: "Make HargaIkan yours.",
    lead: "Tell us your fish preferences before exploring the dashboard. You can change them later.",
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
    lead: "An estimate from a tested model. Estimates are uncertain.",
  },
  perjalanan: {
    title: "Travel cost",
    lead: "Estimate travel from details you enter. HargaIkan never requests your device location.",
  },
  notFound: {
    title: "Page not found",
    lead: "The page you requested does not exist or has moved.",
  },
} as const;

export const HOME = {
  startAction: "Start the demo",
  continueAction: "Continue the demo",
  howItWorks: "What you can do",
  compareTitle: "Check a price",
  compareText: "See a seller’s quote beside a historical reference range, with the source clearly shown.",
  findTitle: "Find another fish",
  findText: "Search the fish catalog and see verified cheaper alternatives when data is available.",
  travelTitle: "Count the trip",
  travelText: "Add the distance, fare, or other travel details you enter to understand your total cost.",
  demoNote: "Demo login is local to this browser tab. It does not verify identity or create a backend account.",
} as const;

export const LOGIN = {
  nameLabel: "Your name",
  namePlaceholder: "For example, Aisyah",
  nameError: "Enter your name to continue.",
  continueAction: "Continue to preferences",
  sessionNote: "This is a demo session. No password or identity details are collected.",
} as const;

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
  startAction: "Save and open dashboard",
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
  gradeLabel: "Grade (optional)",
  allGrades: "All grades",
  sellerPrice: "Seller price (RM/kg, optional)",
  sellerPricePlaceholder: "for example 12.50",
  checkPrice: "Check price",
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
