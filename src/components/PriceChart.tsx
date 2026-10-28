// Weekly median line, P25–P75 band (shaded area) and the user's quote as a reference line.
// A data table is provided for screen readers and keyboard users.
// Colours come from CSS custom properties (see .chart rules in styles.css), so the chart
// follows light/dark mode; SVG presentation attributes here are only fallbacks.

import { CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipValueType } from "recharts";
import type { ChartOut } from "../api/types";
import { date, rmPerKg } from "../format";
import {
  CHART_BAND,
  CHART_BAND_RANGE,
  CHART_COL_MEDIAN,
  CHART_COL_RECORDS,
  CHART_COL_WEEK,
  CHART_MEDIAN_SERIES,
  CHART_QUOTE,
  CHART_TABLE_CAPTION,
  CHART_TABLE_TOGGLE,
} from "../messages";
import { Labels } from "./Labels";

/** Recharts 3 passes `ValueType | undefined`; only finite numbers are formatted as prices. */
export function formatTooltipValue(value: TooltipValueType | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? rmPerKg(n) : "—";
}

const TOOLTIP_STYLE = {
  background: "var(--card)",
  color: "var(--text)",
  border: "none",
  borderRadius: 12,
  boxShadow: "var(--shadow-pop)",
  padding: "8px 12px",
  fontSize: 13,
};

export default function PriceChart({ chart }: { chart: ChartOut }) {
  const data = chart.points.map((p) => ({ week: date(p.week_start), median: p.median, n: p.record_count }));
  // Axis domain only (display padding), not a displayed number.
  const values = [chart.band_p25, chart.band_p75, ...chart.points.map((p) => p.median)];
  if (chart.quote) values.push(chart.quote.value);
  const min = Math.floor(Math.min(...values) * 0.95);
  const max = Math.ceil(Math.max(...values) * 1.05);

  return (
    <figure className="chart">
      <figcaption>
        <span className="chart-title">
          {CHART_MEDIAN_SERIES} in {chart.location.name} (RM/kg)
        </span>{" "}
        <Labels source={chart.source_label} />
        {chart.quote && (
          <>
            {" "}
            <span className="chart-title">· {CHART_QUOTE}</span> <Labels source={chart.quote.source_label} />
          </>
        )}
      </figcaption>
      <div className="chart-box" aria-hidden="true">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#e5e5ea" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} dy={6} />
            <YAxis domain={[min, max]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
            <Tooltip
              formatter={(v: TooltipValueType | undefined) => formatTooltipValue(v)}
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "var(--text-2)", marginBottom: 4 }}
              itemStyle={{ color: "var(--text)", padding: 0 }}
              cursor={{ stroke: "var(--separator-strong)", strokeWidth: 1 }}
            />
            <ReferenceArea
              y1={chart.band_p25}
              y2={chart.band_p75}
              fill="#0071e3"
              fillOpacity={0.08}
              stroke="none"
              label={{ value: CHART_BAND, position: "insideTopLeft", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="median"
              name={CHART_MEDIAN_SERIES}
              stroke="#0071e3"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {chart.quote && (
              <ReferenceLine
                y={chart.quote.value}
                stroke="#6e6e73"
                strokeDasharray="4 4"
                label={{ value: `${CHART_QUOTE} ${rmPerKg(chart.quote.value)}`, position: "insideTopRight", fontSize: 12 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <details className="disclosure">
        <summary>{CHART_TABLE_TOGGLE}</summary>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">{CHART_TABLE_CAPTION}</caption>
            <thead>
              <tr>
                <th scope="col">{CHART_COL_WEEK}</th>
                <th scope="col">{CHART_COL_MEDIAN}</th>
                <th scope="col">{CHART_COL_RECORDS}</th>
              </tr>
            </thead>
            <tbody>
              {chart.points.map((p) => (
                <tr key={p.week_start}>
                  <td>{date(p.week_start)}</td>
                  <td className="num">{rmPerKg(p.median)}</td>
                  <td className="num">{p.record_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="meta">
          {CHART_BAND_RANGE}: <span className="num">{rmPerKg(chart.band_p25)}</span> – <span className="num">{rmPerKg(chart.band_p75)}</span>
        </p>
      </details>
    </figure>
  );
}
