#!/usr/bin/env node
/**
 * One-time media migration for Fase 1.2 of the position-flow audit.
 *
 * Moves the per-position hero photos (apps/web/public/images/lowongan/*.jpg)
 * and the country band photos (apps/web/public/images/countries/*.jpg) into the
 * public `position-media` Supabase Storage bucket, so photos become DATA (read
 * by web + portal by URL, changeable by admins with no deploy) instead of files
 * committed to apps/web and shipped on every build.
 *
 * Storage layout (matches the uploadPositionMedia server action):
 *   position-media/lowongan/<slug>-hero.jpg     <- position hero
 *   position-media/countries/<key>.jpg          <- country band
 *
 * The uploads are INERT to the currently-deployed web: the live site reads
 * positions.content.media.heroUrl (unset until the SQL below runs) and, on the
 * unmerged Fase 1.1 branch, countries.image_url. This script only writes bucket
 * OBJECTS; the matching DB updates are printed as SQL for a separate, reviewed
 * step (--sql) so the "flip what the live page fetches" moment is deliberate.
 *
 * Modes (run from repo root so env + node_modules resolve via apps/web):
 *   node scripts/migrate-position-media.mjs            # dry-run: print plan
 *   node scripts/migrate-position-media.mjs --probe    # prove the pipeline (temp upload+delete)
 *   node scripts/migrate-position-media.mjs --execute  # real bulk upload to the bucket
 *   node scripts/migrate-position-media.mjs --sql      # print the DB update SQL (heroUrl + image_url)
 *
 * Env (read from apps/web/.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..");
const LOWONGAN_DIR = join(REPO, "apps/web/public/images/lowongan");
const COUNTRIES_DIR = join(REPO, "apps/web/public/images/countries");
const BUCKET = "position-media";
const MODE = process.argv[2] ?? "--dry-run";

// Country image filename (key) -> registry key. The registry key is the country
// image basename already, except "saudi.jpg" maps to key "saudi", etc.
const COUNTRY_FILE_TO_KEY = {
  saudi: "saudi",
  jepang: "jepang",
  taiwan: "taiwan",
  europe: "europe",
  mexico: "mexico",
  bulgaria: "bulgaria",
  indonesia: "indonesia",
  // kuwait.jpg is intentionally absent — no source asset. Its registry
  // image_url is set to '' so the web renders the country tint gracefully.
};

function loadEnv() {
  const raw = readFileSync(join(REPO, "apps/web/.env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
// The `position-media` bucket lives in the V2 (current) project. apps/web keeps
// BOTH projects' creds: the plain SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
// the LEGACY project; the current project is the *_V2 vars. Default the target
// to the known V2 ref and require a service key that actually matches it — the
// legacy key here would silently fail (or hit a paused project).
const V2_REF = "jeadtvxgxmqnsqwxjmhj";
const SUPABASE_URL =
  env.SUPABASE_URL_V2 || env.NEXT_PUBLIC_SUPABASE_URL_V2 || `https://${V2_REF}.supabase.co`;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY_V2 || env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing V2 SUPABASE URL or SERVICE_ROLE key.");
  process.exit(1);
}

/** Decode a Supabase JWT's project ref so we fail fast on a wrong-project key. */
function keyRef(jwt) {
  try {
    const payload = jwt.split(".")[1];
    const json = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    return json.ref ?? null;
  } catch {
    return null;
  }
}
const urlRef = new URL(SUPABASE_URL).host.split(".")[0];
if (MODE !== "--dry-run" && MODE !== "--sql") {
  const ref = keyRef(SERVICE_KEY);
  if (ref && ref !== urlRef) {
    console.error(
      `Service key is for project "${ref}" but the bucket is in "${urlRef}".\n` +
        `Set SUPABASE_SERVICE_ROLE_KEY_V2 (the V2 project's service key) or run this\n` +
        `from the deploy env (Vercel), where the correct key is configured.`,
    );
    process.exit(1);
  }
}
const publicUrl = (path) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

function plan() {
  const heroFiles = readdirSync(LOWONGAN_DIR).filter((f) => f.endsWith(".jpg"));
  const countryFiles = readdirSync(COUNTRIES_DIR).filter((f) => f.endsWith(".jpg"));
  const heroes = heroFiles.map((f) => {
    const slug = basename(f, ".jpg");
    return { src: join(LOWONGAN_DIR, f), dest: `lowongan/${slug}-hero.jpg`, slug };
  });
  const countries = countryFiles
    .map((f) => {
      const fileKey = basename(f, ".jpg");
      const key = COUNTRY_FILE_TO_KEY[fileKey];
      if (!key) return null;
      return { src: join(COUNTRIES_DIR, f), dest: `countries/${key}.jpg`, key };
    })
    .filter(Boolean);
  return { heroes, countries };
}

async function upload(client, src, dest) {
  const body = readFileSync(src);
  const { error } = await client.storage
    .from(BUCKET)
    .upload(dest, body, { contentType: "image/jpeg", upsert: true, cacheControl: "3600" });
  if (error) throw new Error(`${dest}: ${error.message}`);
}

async function main() {
  const { heroes, countries } = plan();

  if (MODE === "--dry-run") {
    console.log(`DRY RUN — would upload ${heroes.length} hero + ${countries.length} country images to bucket "${BUCKET}".\n`);
    console.log("Position heroes:");
    for (const h of heroes) console.log(`  ${basename(h.src)}  ->  ${h.dest}`);
    console.log("\nCountry bands:");
    for (const c of countries) console.log(`  ${basename(c.src)}  ->  ${c.dest}`);
    console.log("\nkuwait: no source file -> registry image_url will be '' (tint fallback).");
    console.log("\nNext: --probe to prove the pipeline, then --execute at rollout, then --sql.");
    return;
  }

  const client = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (MODE === "--probe") {
    const probePath = "_probe/pipeline-check.jpg";
    const sample = heroes[0]?.src;
    if (!sample) throw new Error("no sample file to probe with");
    console.log(`Probe: uploading ${basename(sample)} -> ${probePath} ...`);
    await upload(client, sample, probePath);
    const res = await fetch(publicUrl(probePath));
    console.log(`  public URL status: ${res.status} (${res.headers.get("content-type")})`);
    const { error: delErr } = await client.storage.from(BUCKET).remove([probePath]);
    console.log(`  cleanup: ${delErr ? "FAILED " + delErr.message : "removed probe object"}`);
    console.log(res.ok ? "\nPipeline OK — service role can write + public URL serves." : "\nProbe FAILED.");
    return;
  }

  if (MODE === "--execute") {
    console.log(`Uploading ${heroes.length} heroes + ${countries.length} country bands ...`);
    let n = 0;
    for (const h of heroes) {
      await upload(client, h.src, h.dest);
      n++;
    }
    for (const c of countries) {
      await upload(client, c.src, c.dest);
      n++;
    }
    console.log(`Done. ${n} objects uploaded to ${BUCKET}.`);
    console.log("Now run --sql and apply the printed statements to set heroUrl + image_url.");
    return;
  }

  if (MODE === "--sql") {
    // heroUrl: merge into each active position's LIVE content.media. jsonb_set
    // creates the media object if absent. Only positions with a source photo.
    console.log("-- Run these AFTER --execute has uploaded the objects. Reviewed prod mutation.\n");
    console.log("-- 1) Country band image_url -> bucket (kuwait -> '' tint fallback)");
    for (const c of countries) {
      console.log(`update public.countries set image_url = '${publicUrl(c.dest)}' where key = '${c.key}';`);
    }
    console.log(`update public.countries set image_url = '' where key = 'kuwait';\n`);
    console.log("-- 2) Position hero heroUrl -> bucket (active positions with a source photo only)");
    for (const h of heroes) {
      const url = publicUrl(h.dest);
      console.log(
        `update public.positions set content = jsonb_set(coalesce(content,'{}'::jsonb), '{media,heroUrl}', '"${url}"'::jsonb, true) where slug = '${h.slug}' and active = true;`,
      );
    }
    console.log("\n-- marketing: no source photo — leave heroUrl unset until a real photo is uploaded via admin.");
    return;
  }

  console.error(`Unknown mode: ${MODE}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
