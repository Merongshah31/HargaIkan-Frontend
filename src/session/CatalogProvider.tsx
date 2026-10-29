// Loads the public catalog (species + locations) once for all pages.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, errorMessages } from "../api/client";
import type { LocationOut, SpeciesOut } from "../api/types";

export interface CatalogValue {
  species: SpeciesOut[];
  locations: LocationOut[];
  syntheticCatalog: boolean;
  loading: boolean;
  speciesError: string[] | null;
  locationsError: string[] | null;
  /** Default reference location: the first "negeri" level location, else the first one. */
  defaultLocationId: string;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [species, setSpecies] = useState<SpeciesOut[]>([]);
  const [syntheticCatalog, setSyntheticCatalog] = useState(false);
  const [locations, setLocations] = useState<LocationOut[]>([]);
  const [speciesError, setSpeciesError] = useState<string[] | null>(null);
  const [locationsError, setLocationsError] = useState<string[] | null>(null);
  const [pending, setPending] = useState(2);

  useEffect(() => {
    let alive = true;
    api
      .species()
      .then((r) => {
        if (alive) {
          setSyntheticCatalog(r.demo);
          setSpecies(r.demo ? [] : r.items);
        }
      })
      .catch((e) => alive && setSpeciesError(errorMessages(e)))
      .finally(() => alive && setPending((n) => n - 1));
    api
      .locations()
      .then((r) => alive && setLocations(r.items))
      .catch((e) => alive && setLocationsError(errorMessages(e)))
      .finally(() => alive && setPending((n) => n - 1));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<CatalogValue>(() => {
    const visibleLocations = syntheticCatalog ? [] : locations;
    const def = visibleLocations.find((l) => l.level === "negeri") ?? visibleLocations[0];
    return {
      species,
      locations: visibleLocations,
      syntheticCatalog,
      loading: pending > 0,
      speciesError,
      locationsError,
      defaultLocationId: def?.id ?? "",
    };
  }, [species, locations, syntheticCatalog, pending, speciesError, locationsError]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
