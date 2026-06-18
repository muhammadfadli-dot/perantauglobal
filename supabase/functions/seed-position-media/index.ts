// seed-position-media — one-shot seeder.
//
// Copies the position + country imagery (already served publicly by apps/web at
// perantauglobal.com/images/...) into the public `position-media` Storage bucket
// (migration 0075) so app.perantauglobal.com stops 404-ing on every photo.
//
// Runs inside Supabase, so SUPABASE_SERVICE_ROLE_KEY is injected by the platform
// — no credential ever leaves Supabase. Idempotent (upsert). Invoke once:
//   POST { } → fetches each source URL and uploads to position-media/<folder>/<file>.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SOURCE = "https://www.perantauglobal.com/images";
const BUCKET = "position-media";

const LOWONGAN = [
  "assistant-driller", "barista-saudi-arabia", "caregiver-taiwan",
  "chef-bakery-saudi-arabia", "chef-pastry-saudi-arabia",
  "espresso-equipment-maintenance-technician", "food-service-jepang",
  "head-barista-saudi-arabia", "head-driller", "heavy-diesel-mechanic-saudi-arabia",
  "kaigo-jepang", "konstruksi", "laundry-worker-saudi-arabia", "manufaktur-pengelasan",
  "pengolahan-makanan-jepang", "perawat-saudi-arabia", "perawatan-otomotif",
  "plant-engineer", "roaster-saudi-arabia", "sales-engineering",
  "spa-therapist-saudi-arabia", "truck-driver-jepang", "waiter-saudi-arabia",
  "waitress-saudi-arabia", "welder-heavy-steel-plate-fabrication",
];
const COUNTRIES = ["europe", "indonesia", "jepang", "saudi", "taiwan", "mexico"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async () => {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const targets = [
    ...LOWONGAN.map((s) => `lowongan/${s}.jpg`),
    ...COUNTRIES.map((c) => `countries/${c}.jpg`),
  ];

  const uploaded: string[] = [];
  const failed: { path: string; error: string }[] = [];

  for (const path of targets) {
    try {
      const res = await fetch(`${SOURCE}/${path}`);
      if (!res.ok) {
        failed.push({ path, error: `source ${res.status}` });
        continue;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const { error } = await sb.storage.from(BUCKET).upload(path, bytes, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "31536000",
      });
      if (error) {
        failed.push({ path, error: error.message });
      } else {
        uploaded.push(path);
      }
    } catch (e) {
      failed.push({ path, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return json({
    ok: failed.length === 0,
    uploaded: uploaded.length,
    failed,
  });
});
