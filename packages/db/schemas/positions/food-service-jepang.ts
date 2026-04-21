import { z } from "zod";
import { definePosition } from "./common";

const roleDataSchema = z.object({
  jlpt_level: z.enum(["n5", "n4", "n3", "n2", "no_cert"]),
  food_certification: z.enum([
    "ssw_food_service",
    "food_safety",
    "hospitality_cert",
    "none",
  ]),
  experience_type: z.enum([
    "restaurant",
    "hotel",
    "cafe",
    "catering",
    "none",
  ]),
});

export const foodServiceJepang = definePosition(
  {
    slug: "food-service-jepang",
    role: "food_service",
    country: "japan",
    name: "Food Service — Jepang",
    description:
      "Lowongan food service untuk restoran & hotel di Jepang (jalur SSW Food Service).",
    requirements: {
      jlpt_level: { required: true, label: "Level JLPT" },
      food_certification: { required: true, label: "Sertifikasi food service" },
      experience_type: { required: true, label: "Jenis pengalaman kerja" },
    },
  },
  roleDataSchema,
);

export { roleDataSchema as foodServiceJepangRoleDataSchema };
