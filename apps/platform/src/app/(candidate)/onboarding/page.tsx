import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

const COUNTRY_INFO: Record<
  string,
  { label: string; initials: string; description: string; sortKey: number }
> = {
  saudi_arabia: {
    label: "Arab Saudi",
    initials: "SA",
    description: "Perawat · Barista · Waiter",
    sortKey: 1,
  },
  japan: {
    label: "Jepang",
    initials: "JP",
    description: "Caregiver · Truck driver · F&B service",
    sortKey: 2,
  },
  taiwan: {
    label: "Taiwan",
    initials: "TW",
    description: "Caregiver · Operator pabrik",
    sortKey: 3,
  },
  indonesia: {
    label: "Indonesia",
    initials: "ID",
    description: "Hospitality · SPG",
    sortKey: 4,
  },
};

export default async function OnboardingPage() {
  const { candidateId, session } = await requireCandidate();
  const supabase = await createServerClient();

  // If candidate already has applications, skip onboarding
  const { count: appCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("candidate_id", candidateId);
  if ((appCount ?? 0) > 0) redirect("/dashboard");

  // Fetch active positions grouped by country
  const { data: positionsData } = await supabase
    .from("positions")
    .select("slug, name, country, active")
    .eq("active", true);
  const positions = (positionsData ?? []) as Array<{
    slug: string;
    country: string;
    name: string;
  }>;

  // Group by country
  const byCountry = new Map<string, { count: number; positions: string[] }>();
  for (const p of positions) {
    const cur = byCountry.get(p.country) ?? { count: 0, positions: [] };
    cur.count += 1;
    cur.positions.push(p.name);
    byCountry.set(p.country, cur);
  }

  // Get candidate name
  const { data: candidate } = await supabase
    .from("candidates")
    .select("full_name")
    .eq("id", candidateId)
    .single();
  const firstName = (candidate?.full_name ?? session.email ?? "kamu").split(" ")[0];

  // Sort countries: known first by sortKey, then "lainnya"
  const knownCountries: { country: string; count: number }[] = [];
  let lainnyaCount = 0;
  for (const [country, info] of byCountry) {
    if (COUNTRY_INFO[country]) {
      knownCountries.push({ country, count: info.count });
    } else {
      lainnyaCount += info.count;
    }
  }
  knownCountries.sort(
    (a, b) => (COUNTRY_INFO[a.country]?.sortKey ?? 99) - (COUNTRY_INFO[b.country]?.sortKey ?? 99)
  );

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      {/* Brand bar */}
      <header className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg grid place-items-center text-white font-extrabold text-[16px]"
            style={{ background: "var(--pg-red-600)" }}
          >
            P
          </div>
          <span className="font-extrabold text-[15px] tracking-[-0.01em] text-pg-ink-primary">
            Perantau Global
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-[13px] font-semibold text-pg-ink-tertiary no-underline"
        >
          Lewati
        </Link>
      </header>

      <div className="flex-1 px-5 pt-6 flex flex-col gap-6">
        <div>
          <div
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--pg-red-600)" }}
            />
            Selamat datang, {firstName}
          </div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.025em] mt-2 text-pg-ink-primary leading-[36px]">
            Mau kerja di mana dulu?
          </h1>
          <p className="text-[14px] text-pg-ink-tertiary mt-2 leading-tight">
            Pilih satu negara biar kita kasih lowongan yang paling cocok untuk kamu.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {knownCountries.map(({ country, count }) => {
            const info = COUNTRY_INFO[country];
            if (!info) return null;
            return (
              <Link
                key={country}
                href={`/explore?country=${country}`}
                className="bg-pg-white rounded-2xl px-4 py-4 flex items-center gap-3 no-underline text-pg-ink-primary"
                style={{ border: "1px solid var(--pg-border)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center text-white font-bold shrink-0"
                  style={{
                    background: "var(--pg-ink-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                  }}
                >
                  {info.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-extrabold tracking-[-0.01em] truncate">
                    {info.label}
                  </div>
                  <div
                    className="text-[12px] mt-0.5 truncate"
                    style={{ color: "var(--pg-ink-tertiary)" }}
                  >
                    {info.description}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[20px] font-extrabold leading-none text-pg-ink-primary tabular-nums">
                    {count}
                  </div>
                  <div
                    className="text-[10px] font-semibold tracking-[0.06em] uppercase mt-0.5"
                    style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                  >
                    Lowongan
                  </div>
                </div>
              </Link>
            );
          })}
          {lainnyaCount > 0 && (
            <Link
              href="/explore"
              className="bg-pg-white rounded-2xl px-4 py-4 flex items-center gap-3 no-underline text-pg-ink-primary"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <div
                className="w-11 h-11 rounded-xl grid place-items-center text-white font-bold shrink-0"
                style={{ background: "var(--pg-ink-primary)" }}
              >
                <Icon name="plus" size={20} stroke={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-extrabold tracking-[-0.01em]">Negara lain</div>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--pg-ink-tertiary)" }}
                >
                  Taiwan & Indonesia
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[20px] font-extrabold leading-none text-pg-ink-primary tabular-nums">
                  {lainnyaCount}
                </div>
                <div
                  className="text-[10px] font-semibold tracking-[0.06em] uppercase mt-0.5"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  Lowongan
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-px" style={{ background: "var(--pg-border)" }} />
          <span
            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            atau
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--pg-border)" }} />
        </div>

        <div className="flex items-center justify-center gap-1.5 pb-8">
          <span className="text-[13px] text-pg-ink-tertiary">Belum tahu mau ke mana?</span>
          <Link href="/explore" className="text-[13px] font-bold text-pg-red-600 no-underline">
            Lihat semua →
          </Link>
        </div>
      </div>
    </main>
  );
}
