// Loads the public catalog (species + locations) once for all pages.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, errorMessages } from "../api/client";
import type { LocationOut, SpeciesOut } from "../api/types";

export interface CatalogValue {
  species: SpeciesOut[];
  locations: LocationOut[];
  demo: boolean;
  loading: boolean;
  speciesError: string[] | null;
  locationsError: string[] | null;
  /** Default reference location: the first "negeri" level location, else the first one. */
  defaultLocationId: string;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [species, setSpecies] = useState<SpeciesOut[]>([]);
  const [demo, setDemo] = useState(false);
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
          setSpecies(r.items);
          setDemo(r.demo);
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
    const def = locations.find((l) => l.level === "negeri") ?? locations[0];
    return {
      species,
      locations,
      demo,
      loading: pending > 0,
      speciesError,
      locationsError,
      defaultLocationId: def?.id ?? "",
    };
  }, [species, locations, demo, pending, speciesError, locationsError]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
