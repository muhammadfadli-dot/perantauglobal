import { z } from "zod";
import { definePosition } from "./common.js";

const roleDataSchema = z.object({
  experience_type: z.enum([
    "coffee_shop",
    "restaurant",
    "hotel",
    "cafe",
    "other",
  ]),
  english_level: z.enum(["basic", "intermediate", "fluent"]),
  coffee_skills: z
    .array(z.enum(["espresso", "latte_art", "manual_brew", "roasting"]))
    .optional()
    .default([]),
});

export const baristaSaudiArabia = definePosition(
  {
    slug: "barista-saudi-arabia",
    role: "barista",
    country: "saudi_arabia",
    name: "Barista — Saudi Arabia",
    description:
      "Lowongan barista untuk coffee shop & hotel chains di Saudi Arabia.",
    requirements: {
      experience_type: { required: true, label: "Jenis pengalaman kerja" },
      english_level: { required: true, label: "Bahasa Inggris" },
    },
  },
  roleDataSchema,
);

export { roleDataSchema as baristaSaudiArabiaRoleDataSchema };
