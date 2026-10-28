import type { ReactNode } from "react";
import type { SourceLabelText } from "../api/types";
import { translateApiText } from "../i18n";
import { INFO_ICON, SOURCE_ICONS, WARNING_ICON } from "../messages";
function iconFor(label: string): string { const first = label.split("·")[0].trim() as SourceLabelText; return SOURCE_ICONS[first] ?? "🏷️"; }
export function SourceBadge({ label }: { label: string }) { return <span className="badge badge-source" data-testid="source-label"><span aria-hidden="true">{iconFor(label)}</span> <span>{translateApiText(label)}</span></span>; }
export function Labels({ source }: { source: string }) { return <SourceBadge label={source} />; }
type Tone = "info" | "warning" | "error";
export function Notice({ tone = "info", children, live }: { tone?: Tone; children: ReactNode; live?: boolean }) { const icon = tone === "info" ? INFO_ICON : WARNING_ICON; return <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : live ? "status" : undefined}><span aria-hidden="true" className="notice-icon">{icon}</span><div>{typeof children === "string" ? translateApiText(children) : children}</div></div>; }
export function ErrorMessages({ messages }: { messages: string[] | null | undefined }) { if (!messages?.length) return null; return <Notice tone="error">{messages.length === 1 ? <p>{translateApiText(messages[0])}</p> : <ul>{messages.map((m) => <li key={m}>{translateApiText(m)}</li>)}</ul>}</Notice>; }
