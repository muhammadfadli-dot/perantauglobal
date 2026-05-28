/**
 * Server-side: event landing-page data for apps/web.
 *
 * Source of truth = `events` table (status = 'published'). LP copy lives in
 * `events.content` JSONB so a new event = one INSERT, no code deploy.
 *
 * All reads use the anon client + RLS (events_anon_read_published). Reads are
 * defensive: if the table doesn't exist yet (migration 0055 not applied) we
 * return null/[] so the build + runtime degrade to 404 instead of crashing.
 */

import { supabaseV2 } from "./supabase-v2";

export type EventSpeaker = {
  name: string;
  role?: string;
  org?: string;
  photo?: string;
};

export type EventContent = {
  tagline?: string;
  intro?: string;
  audience?: string;
  host?: string;
  poster?: string;
  benefits?: string[];
  speakers?: EventSpeaker[];
};

export type EventDetail = {
  slug: string;
  title: string;
  kind: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  platform: string;
  joinUrl: string | null;
  coverImage: string | null;
  content: EventContent;
};

function coerceContent(raw: unknown): EventContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as EventContent;
}

export async function fetchEvent(slug: string): Promise<EventDetail | null> {
  try {
    const { data, error } = await supabaseV2()
      .from("events")
      .select(
        "slug, title, kind, starts_at, ends_at, timezone, platform, join_url, cover_image, content",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;

    return {
      slug: data.slug,
      title: data.title,
      kind: data.kind,
      startsAt: data.starts_at,
      endsAt: data.ends_at,
      timezone: data.timezone,
      platform: data.platform,
      joinUrl: data.join_url,
      coverImage: data.cover_image,
      content: coerceContent(data.content),
    };
  } catch {
    return null;
  }
}

export async function fetchPublishedEventSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabaseV2()
      .from("events")
      .select("slug")
      .eq("status", "published");
    if (error || !data) return [];
    return data.map((r) => r.slug);
  } catch {
    return [];
  }
}

/** Format an event's start time for display in its own timezone. */
export function formatEventWhen(startsAt: string, timezone: string) {
  const d = new Date(startsAt);
  const dateLabel = d.toLocaleDateString("id-ID", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeLabel = d.toLocaleTimeString("id-ID", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
  const tzAbbr = timezone === "Asia/Jakarta" ? "WIB" : timezone;
  return { dateLabel, timeLabel: `${timeLabel} ${tzAbbr}` };
}
