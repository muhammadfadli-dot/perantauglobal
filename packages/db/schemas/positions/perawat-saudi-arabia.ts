import { z } from "zod";
import { definePosition } from "./common";

const roleDataSchema = z.object({
  str_active: z.enum(["yes", "no", "inProgress"]),
  experience_years: z.enum(["1-2", "3-5", "5+"]),
  english_level: z.enum(["basic", "intermediate", "fluent"]),
});

export const perawatSaudiArabia = definePosition(
  {
    slug: "perawat-saudi-arabia",
    role: "nurse",
    country: "saudi_arabia",
    name: "Perawat — Saudi Arabia",
    description:
      "Lowongan perawat Indonesia untuk rumah sakit & klinik di Saudi Arabia.",
    requirements: {
      str_active: {
        type: "hard",
        label: "STR aktif",
        allowed_values: ["yes", "inProgress"],
      },
      experience_years: { type: "soft", label: "Pengalaman kerja" },
      english_level: { type: "soft", label: "Bahasa Inggris" },
    },
  },
  roleDataSchema,
);

export { roleDataSchema as perawatSaudiArabiaRoleDataSchema };
