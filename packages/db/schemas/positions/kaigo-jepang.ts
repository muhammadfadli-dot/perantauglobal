import { z } from "zod";
import { definePosition } from "./common";

const roleDataSchema = z.object({
  jlpt_level: z.enum(["n5", "n4", "n3", "n2", "no_cert"]),
  care_certification: z.enum([
    "ssw_kaigo",
    "nursing_d3",
    "nursing_s1",
    "caregiver_training",
    "none",
  ]),
  experience_years: z.enum(["none", "less_than_1", "1-3", "3+"]),
});

export const kaigoJepang = definePosition(
  {
    slug: "kaigo-jepang",
    role: "kaigo",
    country: "japan",
    name: "Kaigo (Caregiver) — Jepang",
    description:
      "Lowongan kaigo untuk panti jompo & fasilitas perawatan di Jepang (jalur SSW Kaigo).",
    requirements: {
      jlpt_level: {
        type: "hard",
        label: "Level JLPT",
        allowed_values: ["n4", "n3", "n2"],
      },
      care_certification: { type: "soft", label: "Sertifikasi perawatan" },
      experience_years: { type: "soft", label: "Pengalaman kerja" },
    },
  },
  roleDataSchema,
);

export { roleDataSchema as kaigoJepangRoleDataSchema };
