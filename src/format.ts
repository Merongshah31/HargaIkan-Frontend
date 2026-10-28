import { translateApiText } from "./i18n";
export function rm(value: number | null | undefined): string { if (value === null || value === undefined || Number.isNaN(value)) return "—"; return `RM${value.toFixed(2)}`; }
export function rmPerKg(value: number | null | undefined): string { return value === null || value === undefined ? "—" : `${rm(value)}/kg`; }
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function date(iso: string | null | undefined): string { if (!iso) return "—"; const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso); return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? m[2]} ${m[1]}` : iso; }
export function period(start: string, end: string): string { return `${date(start)} – ${date(end)}`; }
export function travelValue(value: string | null, display: string, unit: string): string { if (value === null) return translateApiText(display); if (unit === "RM") return `RM${value}`; if (unit.startsWith("RM/")) return `RM${value}/${unit.slice(3)}`; return `${value} ${unit}`; }
