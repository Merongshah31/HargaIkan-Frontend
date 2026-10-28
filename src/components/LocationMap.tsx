// Minimal OpenStreetMap-based map (CARTO Positron / Dark Matter tiles, no API key) with a small
// circle marker for every location that HAS coordinates (from the API). Locations without
// coordinates are still listed in the location selector. Device geolocation is never requested.

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { LocationOut } from "../api/types";

interface Props {
  locations: LocationOut[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const TILES_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILES_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
// Leaflet sets SVG attributes directly, so marker colours mirror the CSS --accent token.
const ACCENT_LIGHT = "#0071e3";
const ACCENT_DARK = "#2997ff";

function usePrefersDark(): boolean {
  const query = "(prefers-color-scheme: dark)";
  const get = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  const [dark, setDark] = useState(get);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(query);
    const onChange = () => setDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return dark;
}

export default function LocationMap({ locations, selectedId, onSelect }: Props) {
  const dark = usePrefersDark();
  const pins = locations.filter((l) => l.has_coordinates && l.lat !== null && l.lng !== null);
  if (pins.length === 0) return null;
  const bounds: LatLngBoundsExpression = pins.map((l) => [l.lat as number, l.lng as number]);
  const accent = dark ? ACCENT_DARK : ACCENT_LIGHT;
  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [24, 24], maxZoom: 15 }} scrollWheelZoom={false} className="map">
      <TileLayer key={dark ? "dark" : "light"} attribution={ATTRIBUTION} url={dark ? TILES_DARK : TILES_LIGHT} subdomains="abcd" maxZoom={20} />
      {pins.map((l) => {
        const selected = l.id === selectedId;
        return (
          <CircleMarker
            key={l.id}
            center={[l.lat as number, l.lng as number]}
            radius={selected ? 9 : 6}
            pathOptions={{
              color: dark ? "#1c1c1e" : "#ffffff",
              weight: 2,
              fillColor: accent,
              fillOpacity: selected ? 1 : 0.75,
            }}
            eventHandlers={{ click: () => onSelect(l.id) }}
          >
            <Tooltip>
              {l.name}
              {selected ? " (selected)" : ""}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
