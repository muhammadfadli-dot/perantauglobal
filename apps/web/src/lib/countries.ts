/**
 * Web-side accessor for the country registry (public.countries).
 *
 * Reads the live DB via the anon client so a country added in the admin appears
 * on the public site without a code deploy. Falls back to the embedded snapshot
 * (all 8 live countries) when the DB is unreachable. Wrapped in React cache() so
 * every server component in one request shares a single fetch; the /lowongan and
 * /lowongan/[slug] routes are ISR (revalidate 60), so the read is at most ~60s
 * stale, and admin country writes revalidate those paths explicitly.
 */
import { cache } from "react";
import { getCountryRegistry, type CountryRegistry } from "@perantauglobal/db/country";
import { supabaseV2 } from "./supabase-v2";

export const getCountries = cache(
  async (): Promise<CountryRegistry> => getCountryRegistry(supabaseV2()),
);

export type { CountryRegistry, CountryMeta } from "@perantauglobal/db/country";
