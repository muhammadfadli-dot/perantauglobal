import { z } from "zod";
import { definePosition } from "./common";

/**
 * Global Talent Hub is a broad-intake program — candidate indicates interest
 * and we match them to specific lowongan later. Fewer hard requirements;
 * readiness score stays low until they pick a specific position.
 */
const roleDataSchema = z.object({
  current_status: z.string().min(1),
  interested_country: z.string().min(1),
  has_lpk: z.enum(["yes", "no"]),
});

export const globalTalentHub = definePosition(
  {
    slug: "global-talent-hub",
    role: "general",
    country: "any",
    name: "Global Talent Hub",
    description:
      "Program penyaluran umum. Calon mendaftar minat lalu dicocokkan ke lowongan spesifik.",
    requirements: {
      interested_country: { required: true, label: "Negara tujuan minat" },
      current_status: { required: true, label: "Status saat ini" },
    },
  },
  roleDataSchema,
);

export { roleDataSchema as globalTalentHubRoleDataSchema };
