// Minimal OpenStreetMap map with a small circle marker for every location that HAS coordinates (from
// the API). Locations without coordinates are still listed in the location selector, and device
// geolocation is never requested.

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { LocationOut } from "../api/types";
import { useLanguage } from "../i18n";

interface Props {
  locations: LocationOut[];
  selectedId: string;
  onSelect: (id: string) => void;
}

// OpenStreetMap's own tile server: no API key, no subdomains ({s} is not used) and no retina variant.
// The attribution is part of the ODbL licence, so it must stay visible on the map.
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
/** OSM publishes tiles up to zoom 19; Leaflet must not ask for more or the request 404s. */
const MAX_TILE_ZOOM = 19;
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
  const { t } = useLanguage();
  // A tile that fails leaves a blank patch, so say it once instead of showing an empty map.
  const [tilesFailed, setTilesFailed] = useState(false);
  const pins = locations.filter((l) => l.has_coordinates && l.lat !== null && l.lng !== null);
  if (pins.length === 0) return null;
  const bounds: LatLngBoundsExpression = pins.map((l) => [l.lat as number, l.lng as number]);
  const accent = dark ? ACCENT_DARK : ACCENT_LIGHT;
  return (
    <>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [24, 24], maxZoom: 15 }}
        scrollWheelZoom={false}
        className={dark ? "map map-dark" : "map"}
      >
        <TileLayer
          attribution={ATTRIBUTION}
          url={TILES}
          maxZoom={MAX_TILE_ZOOM}
          eventHandlers={{ tileerror: () => setTilesFailed(true) }}
        />
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
                {selected ? ` (${t.fishFinder.selectedTag})` : ""}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {tilesFailed && (
        <p className="meta" role="status">
          {t.fishFinder.mapTilesUnavailable}
        </p>
      )}
    </>
  );
}
