import { baristaSaudiArabia } from "./barista-saudi-arabia.js";
import { foodServiceJepang } from "./food-service-jepang.js";
import { globalTalentHub } from "./global-talent-hub.js";
import { kaigoJepang } from "./kaigo-jepang.js";
import { perawatSaudiArabia } from "./perawat-saudi-arabia.js";
import { truckDriverJepang } from "./truck-driver-jepang.js";
import { waiterSaudiArabia } from "./waiter-saudi-arabia.js";

export * from "./common.js";
export { baristaSaudiArabia } from "./barista-saudi-arabia.js";
export { foodServiceJepang } from "./food-service-jepang.js";
export { globalTalentHub } from "./global-talent-hub.js";
export { kaigoJepang } from "./kaigo-jepang.js";
export { perawatSaudiArabia } from "./perawat-saudi-arabia.js";
export { truckDriverJepang } from "./truck-driver-jepang.js";
export { waiterSaudiArabia } from "./waiter-saudi-arabia.js";

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
