#!/usr/bin/env tsx
/**
 * Upload position + country imagery from apps/web/public/images into the public
 * Supabase Storage bucket `position-media` (migration 0075). Run once; idempotent
 * (upsert). Fixes the portal 404s where apps/platform has no /public images.
 *
 *   SUPABASE_URL=https://jeadtvxgxmqnsqwxjmhj.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   pnpm --filter @perantauglobal/db exec tsx scripts/upload-position-media.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const BUCKET = "position-media";
const WEB_IMAGES = resolve(__dirname, "../../../apps/web/public/images");
const FOLDERS = ["lowongan", "countries"] as const;

const sb = createClient(url, key, { auth: { persistSession: false } });

function contentType(file: string): string {
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

async function main() {
  let ok = 0;
  let fail = 0;
  for (const folder of FOLDERS) {
    const dir = join(WEB_IMAGES, folder);
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
    } catch {
      console.warn(`skip ${folder}: directory not found`);
      continue;
    }
    for (const file of files) {
      const buf = readFileSync(join(dir, file));
      const path = `${folder}/${file}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
        contentType: contentType(file),
        upsert: true,
        cacheControl: "31536000",
      });
      if (error) {
        fail++;
        console.error(`✗ ${path}: ${error.message}`);
      } else {
        ok++;
        console.log(`✓ ${path}`);
      }
    }
  }
  console.log(`\nDone: ${ok} uploaded, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main();
