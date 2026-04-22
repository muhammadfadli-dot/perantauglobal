import { z } from "zod";
import { definePosition } from "./common";

const roleDataSchema = z.object({
  sim_type: z.enum(["sim_a", "sim_b1", "sim_b2", "sim_internasional"]),
  driving_years: z.enum(["1-2", "3-5", "5+"]),
  jlpt_level: z.enum(["n5", "n4", "n3", "n2", "no_cert"]),
});

export const truckDriverJepang = definePosition(
  {
    slug: "truck-driver-jepang",
    role: "truck_driver",
    country: "japan",
    name: "Truck Driver — Jepang",
    description:
      "Lowongan sopir truk untuk perusahaan logistik di Jepang (jalur Tokutei Ginou).",
    requirements: {
      sim_type: {
        type: "hard",
        label: "Jenis SIM",
        allowed_values: ["sim_b1", "sim_b2", "sim_internasional"],
      },
      driving_years: { type: "soft", label: "Pengalaman mengemudi" },
      jlpt_level: { type: "soft", label: "Level JLPT" },
    },
  },
  roleDataSchema,
);

export { roleDataSchema as truckDriverJepangRoleDataSchema };
