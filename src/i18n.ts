import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LANGUAGE_STORAGE_KEY,
  MESSAGES,
  SOURCE_LABELS,
  SOURCE_LABELS_MS,
  type AppMessages,
  type Language,
} from "./messages";

export function readStoredLanguage(): Language {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
    return raw === "ms" ? "ms" : "en";
  } catch {
    return "en";
  }
}

export function writeStoredLanguage(lang: Language): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.lang = lang;
    }
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: AppMessages;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => readStoredLanguage());

  useEffect(() => {
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    writeStoredLanguage(next);
    setLangState(next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: MESSAGES[lang],
    }),
    [lang, setLang],
  );

  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context) return context;
  const lang = readStoredLanguage();
  return {
    lang,
    setLang: writeStoredLanguage,
    t: MESSAGES[lang],
  };
}

const EXACT: Record<string, string> = {
  "Di bawah julat sejarah": "Below the historical range",
  "Dalam julat sejarah": "Within the historical range",
  "Di atas julat sejarah": "Above the historical range",
  "Data belum tersedia": "Data is not available yet",
  "Tiada cadangan": "No recommendations",
  "Cadangan ini bukan nasihat perubatan. Jika anda mempunyai alergi makanan, semak nama spesies, label produk dan risiko pencemaran silang dengan penjual atau profesional kesihatan.":
    "These recommendations are not medical advice. If you have food allergies, check the species name, product label, and cross-contamination risk with the seller or a healthcare professional.",
  "Kos perjalanan belum dianggarkan": "Travel cost has not been estimated yet",
  "Belum dikira": "Not calculated yet",
  "Sila masukkan harga yang sah melebihi RM0.": "Enter a valid price above RM0.",
  "Sila taip nama ikan.": "Enter a fish name.",
  "Ikan tidak ditemui. Cuba nama lain.": "Fish not found. Try another name.",
  "Adakah ini ikan yang anda maksudkan?": "Is this the fish you meant?",
  "Carian ringkas digunakan buat sementara waktu.": "Basic search is being used temporarily.",
  "Data harga ikan asal belum tersedia.": "The original fish price data is not available yet.",
  "Melebihi bajet": "Over budget",
  "Ikan ini sepadan dengan alergi dalam profil anda. Sila berhati-hati.":
    "This fish matches an allergy in your profile. Please take care.",
  "Ramalan belum tersedia.": "Forecast unavailable.",
  "Julat anggaran menunjukkan harga mungkin melebihi P75 sejarah dalam tempoh ini.":
    "The estimated range suggests the price may exceed the historical P75 in this period.",
  "Sila beri persetujuan sebelum menyimpan maklumat alergi.":
    "Give consent before saving allergy information.",
  "Sila beri persetujuan sebelum menyimpan lokasi pilihan.":
    "Give consent before saving a preferred location.",
  "Profil anda disimpan untuk sesi pelayar ini.": "Your profile is stored for this browser session.",
  "Lengkapkan profil anda untuk melihat papan pemuka peribadi.":
    "Complete your profile to see a personalised dashboard.",
  "Bahagian ini tidak dapat dimuatkan buat masa ini.": "This section is unavailable right now.",
  "Profil tidak dapat dimuatkan buat masa ini. Harga rujukan masih boleh dilihat.":
    "Your profile is unavailable right now. Price references are still available.",
  "Data cuaca (MET Malaysia) belum disambungkan.": "Weather data (MET Malaysia) is not connected yet.",
  "Kalendar musim dan perayaan belum disambungkan.": "The season and festival calendar is not connected yet.",
  // Supply alerts: the Open-Meteo forecast reduced by HargaIkan's own thresholds, plus the
  // maintained public-holiday calendar. Every alert names its source, so both are translated.
  "Open-Meteo (ramalan cuaca Kuala Lumpur, bukan amaran rasmi MET Malaysia)":
    "Open-Meteo (Kuala Lumpur weather forecast, not an official MET Malaysia warning)",
  "Kalendar cuti umum Malaysia (kabinet.gov.my)": "Malaysian public-holiday calendar (kabinet.gov.my)",
  "Data cuaca (Open-Meteo) tidak dapat dibaca sekarang.":
    "Weather data (Open-Meteo) could not be read right now.",
  "Kalendar perayaan tidak dapat dibaca, jadi tiada alert perayaan dipaparkan.":
    "The festival calendar could not be read, so no festival alert is shown.",
  "Hujan lebat dijangka": "Heavy rain expected",
  "Hujan sangat lebat dijangka": "Very heavy rain expected",
  "Angin kuat dijangka": "Strong wind expected",
  "Cuaca panas dijangka": "Hot day expected",
  "Perayaan ini hari ini. HargaIkan menyenaraikannya daripada kalendar cuti umum, bukan ramalan harga.":
    "This festival is today. It comes from HargaIkan's public-holiday calendar, not a price forecast.",
  // Festival names as they appear in data/curated/festivals.yaml.
  "Tahun Baru": "New Year's Day",
  "Hari Wilayah Persekutuan": "Federal Territory Day",
  "Tahun Baru Cina": "Chinese New Year",
  "Hari Pekerja": "Labour Day",
  "Hari Wesak": "Wesak Day",
  "Hari Keputeraan YDP Agong": "Agong's Birthday",
  "Maulidur Rasul": "Prophet Muhammad's Birthday",
  "Hari Merdeka": "Merdeka Day",
  "Hari Malaysia": "Malaysia Day",
  "Hari Krismas": "Christmas Day",
  "Ikan yang dipilih tidak dikenali. Sila pilih daripada senarai.":
    "The selected fish is not recognised. Choose one from the list.",
  "Lokasi yang dipilih tidak dikenali. Sila pilih daripada senarai.":
    "The selected location is not recognised. Choose one from the list.",
  "Sesi tidak sah. Sila muat semula halaman.": "Your session is invalid. Refresh the page.",
  "Permintaan tidak sah. Sila semak maklumat yang dimasukkan.":
    "Invalid request. Check the information entered.",
  "Maklumat yang diminta tidak ditemui.": "The requested information was not found.",
  "Dalam bajet": "Within budget",
  "Profil anda telah disimpan.": "Your profile has been saved.",
  "Semua data anda telah dipadam.": "All your data has been deleted.",
  "Persetujuan alergi ditarik balik. Maklumat alergi anda telah dipadam.":
    "Allergy consent was withdrawn. Your allergy information has been deleted.",
  "Persetujuan lokasi ditarik balik. Lokasi pilihan anda telah dipadam.":
    "Location consent was withdrawn. Your preferred location has been deleted.",
  "Tiada lokasi pilihan disimpan. Rujukan Kuala Lumpur digunakan.":
    "No preferred location is saved. Kuala Lumpur is used as the reference.",
  "Ikan dengan rekod harga terbanyak di Kuala Lumpur":
    "Fish with the most price records in Kuala Lumpur",
  "Kos perjalanan dipaparkan berasingan daripada kos ikan.":
    "Travel costs are shown separately from fish costs.",
  "Kos bahan api": "Fuel cost",
  "Isipadu bahan api": "Fuel volume",
  "Tol": "Tolls",
  "Parkir": "Parking",
  "Jumlah kos perjalanan": "Total travel cost",
  "Kos ikan": "Fish cost",
  "Jumlah keseluruhan": "Grand total",
  "Kos sebenar per kg": "Effective cost per kg",
  "Jarak sehala (km)": "One-way distance (km)",
  "Kecekapan bahan api (km/l)": "Fuel efficiency (km/l)",
  "Harga bahan api (RM/l)": "Fuel price (RM/l)",
  "Tambang": "Fare",
  "Harga ikan (RM/kg)": "Fish price (RM/kg)",
  "Kuantiti (kg)": "Quantity (kg)",
  "Kos perjalanan tidak digunakan dalam ramalan harga.":
    "Travel costs are not used in price forecasts.",
  "Jadual tambang tidak dapat digunakan buat masa ini. Sila masukkan tambang sendiri.":
    "The fare table is unavailable right now. Enter a fare yourself.",
  "Ramalan hanya dipaparkan selepas model diterbitkan dan mengatasi garis dasar.":
    "Forecasts are shown only after a model is published and outperforms the baseline.",
};

const REVERSE_EXACT: Record<string, string> = Object.fromEntries(
  Object.entries(EXACT).map(([ms, en]) => [en, ms]),
);

export function translateApiText(value: string | null | undefined, lang: Language = readStoredLanguage()): string {
  if (!value) return value ?? "";

  if (lang === "ms") {
    if (REVERSE_EXACT[value]) return REVERSE_EXACT[value];
    if (value.includes(" · ")) {
      return value
        .split(" · ")
        .map((part) => translateApiText(part.trim(), "ms"))
        .join(" · ");
    }
    return SOURCE_LABELS_MS[value as keyof typeof SOURCE_LABELS_MS] ?? value;
  }

  if (EXACT[value]) return EXACT[value];
  if (value.includes(" · ")) {
    return value
      .split(" · ")
      .map((part) => translateApiText(part.trim(), "en"))
      .join(" · ");
  }
  const fallback = /^Data khusus (.+) belum tersedia\. Rujukan (.+) digunakan\.$/.exec(value);
  if (fallback) return `Specific data for ${fallback[1]} is not available yet. ${fallback[2]} is used as the reference.`;
  const budget = /^Bajet mesti nombor antara RM0\.01 dan RM(.+)\/kg\.$/.exec(value);
  if (budget) return `Budget must be a number between RM0.01 and RM${budget[1]}/kg.`;
  const invalidField = /^(.+) mesti nombor yang sah\.$/.exec(value);
  if (invalidField) return `${translateApiText(invalidField[1], "en")} must be a valid number.`;
  // Alert bodies: the numbers come from the forecast or the countdown, so they are patterns.
  const rain = /^Ramalan Open-Meteo menunjukkan ([\d.]+) mm hujan terkumpul\. HargaIkan menandakan hari pada ([\d.]+) mm atau lebih\.$/.exec(value);
  if (rain) return `Open-Meteo forecasts ${rain[1]} mm of rain. HargaIkan flags a day at ${rain[2]} mm or more.`;
  const wind = /^Ramalan Open-Meteo menunjukkan angin sehingga ([\d.]+) km\/j\. HargaIkan menandakan hari pada ([\d.]+) km\/j atau lebih\.$/.exec(value);
  if (wind) return `Open-Meteo forecasts wind up to ${wind[1]} km/h. HargaIkan flags a day at ${wind[2]} km/h or more.`;
  const heat = /^Ramalan Open-Meteo menunjukkan suhu sehingga ([\d.]+) °C\. HargaIkan menandakan hari pada ([\d.]+) °C atau lebih\.$/.exec(value);
  if (heat) return `Open-Meteo forecasts up to ${heat[1]} °C. HargaIkan flags a day at ${heat[2]} °C or more.`;
  const festival = /^Perayaan ini (\d+) hari dari sekarang\. HargaIkan menyenaraikannya daripada kalendar cuti umum, bukan ramalan harga\.$/.exec(value);
  if (festival) {
    return `This festival is ${festival[1]} days away. It comes from HargaIkan's public-holiday calendar, not a price forecast.`;
  }
  return SOURCE_LABELS[value as keyof typeof SOURCE_LABELS] ?? value;
}
