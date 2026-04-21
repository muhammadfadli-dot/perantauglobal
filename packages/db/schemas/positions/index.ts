import { baristaSaudiArabia } from "./barista-saudi-arabia";
import { foodServiceJepang } from "./food-service-jepang";
import { globalTalentHub } from "./global-talent-hub";
import { kaigoJepang } from "./kaigo-jepang";
import { perawatSaudiArabia } from "./perawat-saudi-arabia";
import { truckDriverJepang } from "./truck-driver-jepang";
import { waiterSaudiArabia } from "./waiter-saudi-arabia";

export * from "./common";
export { baristaSaudiArabia } from "./barista-saudi-arabia";
export { foodServiceJepang } from "./food-service-jepang";
export { globalTalentHub } from "./global-talent-hub";
export { kaigoJepang } from "./kaigo-jepang";
export { perawatSaudiArabia } from "./perawat-saudi-arabia";
export { truckDriverJepang } from "./truck-driver-jepang";
export { waiterSaudiArabia } from "./waiter-saudi-arabia";

/**
 * Registry of all positions keyed by slug. Used by:
 * - `/api/apply` endpoint to validate incoming submissions
 * - seed migration to populate `positions` table
 * - admin CRM to render pipeline config per position
 *
 * Note: SPG (Sekolah Pekerja Global) has custom scoring logic and lives
 * outside this registry. Add it when Phase 1 needs it.
 */
export const positions = {
  "barista-saudi-arabia": baristaSaudiArabia,
  "food-service-jepang": foodServiceJepang,
  "global-talent-hub": globalTalentHub,
  "kaigo-jepang": kaigoJepang,
  "perawat-saudi-arabia": perawatSaudiArabia,
  "truck-driver-jepang": truckDriverJepang,
  "waiter-saudi-arabia": waiterSaudiArabia,
} as const;

export type PositionSlug = keyof typeof positions;

export function getPosition(slug: string) {
  return (positions as Record<string, (typeof positions)[PositionSlug] | undefined>)[slug];
}
