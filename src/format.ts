import { readStoredLanguage, translateApiText } from "./i18n";
import type { Language } from "./messages";

export function rm(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `RM${value.toFixed(2)}`;
}

export function rmPerKg(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${rm(value)}/kg`;
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_MS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];

export function date(iso: string | null | undefined, lang: Language = readStoredLanguage()): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = lang === "ms" ? MONTHS_MS : MONTHS_EN;
  return `${Number(m[3])} ${months[Number(m[2]) - 1] ?? m[2]} ${m[1]}`;
}

export function period(start: string, end: string, lang: Language = readStoredLanguage()): string {
  return `${date(start, lang)} – ${date(end, lang)}`;
}

export function travelValue(value: string | null, display: string, unit: string, lang: Language = readStoredLanguage()): string {
  if (value === null) return translateApiText(display, lang);
  if (unit === "RM") return `RM${value}`;
  if (unit.startsWith("RM/")) return `RM${value}/${unit.slice(3)}`;
  return `${value} ${unit}`;
}
