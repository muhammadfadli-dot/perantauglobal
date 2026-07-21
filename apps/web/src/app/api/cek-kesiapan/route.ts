import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseV2, isV2Configured } from "@/lib/supabase-v2";
import {
  QUESTION_IDS,
  scorePersona,
  SESSION_KEY,
  type AnswerKey,
  type QuestionId,
  type Sector,
} from "@/lib/cek-kesiapan";
import { READINESS_CONSENT_REQUIRED_MSG } from "@/lib/readiness-consent";

export const runtime = "nodejs";

interface Payload {
  name?: string;
  answers?: Record<string, string>;
  sector?: string;
  session_key?: string;
  website?: string; // honeypot
  /**
   * PDP UU 27/2022 Pasal 20: affirmative consent ticked on the intro screen.
   * Must be exactly `true` - this route stores a name, so without the tick
   * there is no lawful basis and nothing is inserted.
   */
  consent_granted?: boolean;
}

const VALID_ANSWERS: AnswerKey[] = ["a", "b", "c"];
const VALID_SECTORS: Sector[] = ["hospitality", "healthcare", "unsure"];

function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  // strip control chars, collapse inner whitespace, cap length (keeps spaces + hyphens)
  const s = v
    .split("")
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;
  return s.slice(0, 40);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;

    // Honeypot: a filled hidden field means a bot. Return clean 200, no insert.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const name = cleanName(body.name);
    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
    }

    // PDP: re-checked server-side so a client that skips the box (or posts
    // straight to the API) cannot get a personal-data row written.
    if (body.consent_granted !== true) {
      return NextResponse.json(
        { error: READINESS_CONSENT_REQUIRED_MSG },
        { status: 400 }
      );
    }

    // Coerce + validate the 6 readiness answers.
    const answers: Partial<Record<QuestionId, AnswerKey>> = {};
    const raw = body.answers ?? {};
    for (const id of QUESTION_IDS) {
      const a = raw[id];
      if (typeof a === "string" && VALID_ANSWERS.includes(a as AnswerKey)) {
        answers[id] = a as AnswerKey;
      }
    }
    if (Object.keys(answers).length < QUESTION_IDS.length) {
      return NextResponse.json(
        { error: "Semua pertanyaan wajib dijawab." },
        { status: 400 },
      );
    }

    const sector: Sector | null =
      typeof body.sector === "string" && VALID_SECTORS.includes(body.sector as Sector)
        ? (body.sector as Sector)
        : null;

    const { score, persona } = scorePersona(answers);
    const sessionKey =
      typeof body.session_key === "string" && body.session_key.trim()
        ? body.session_key.trim().slice(0, 64)
        : SESSION_KEY;

    if (!isV2Configured()) {
      // Never hard-fail the participant: return the computed result anyway.
      console.error("[cek-kesiapan] supabase v2 not configured; skipping insert");
      return NextResponse.json({ success: true, persona, score, stored: false });
    }

    // Untyped client: readiness_responses is newer than the generated types.
    const db = supabaseV2() as unknown as SupabaseClient;
    const { error } = await db.from("readiness_responses").insert({
      session_key: sessionKey,
      name,
      answers,
      persona,
      score,
      sector_interest: sector,
    });

    if (error) {
      console.error("[cek-kesiapan] insert failed:", error.message);
      // Still give the user their result; the live board just misses this one.
      return NextResponse.json({ success: true, persona, score, stored: false });
    }

    return NextResponse.json({ success: true, persona, score, stored: true });
  } catch (err) {
    console.error("[cek-kesiapan] error:", err);
    return NextResponse.json(
      { error: "Gagal memproses. Coba lagi sebentar." },
      { status: 500 },
    );
  }
}
