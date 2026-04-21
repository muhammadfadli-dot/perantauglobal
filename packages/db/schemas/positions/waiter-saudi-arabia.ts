import { z } from "zod";
import { definePosition } from "./common.js";

const roleDataSchema = z.object({
  experience_type: z.enum([
    "restaurant",
    "hotel",
    "cafe",
    "catering",
    "other",
  ]),
  english_level: z.enum(["basic", "intermediate", "fluent"]),
});

export const waiterSaudiArabia = definePosition(
  {
    slug: "waiter-saudi-arabia",
    role: "waiter",
    country: "saudi_arabia",
    name: "Waiter — Saudi Arabia",
    description:
      "Lowongan waiter untuk restoran & hotel di Saudi Arabia.",
    requirements: {
      experience_type: { required: true, label: "Jenis pengalaman kerja" },
      english_level: { required: true, label: "Bahasa Inggris" },
    },
  },
  roleDataSchema,
);

export { roleDataSchema as waiterSaudiArabiaRoleDataSchema };
