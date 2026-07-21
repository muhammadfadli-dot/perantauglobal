import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { SectionHead } from "@/components/pg/candidate/BerandaShared";
import { formatMemberId } from "@/lib/candidate";
import { WEB_POLICY_ORIGIN } from "@/lib/signup-consent";
import { waLink } from "@/lib/contact";
import {
  getConsentMeta,
  PDP_REQUEST_EMAIL,
  PDP_REQUEST_SUBJECT,
  PDP_RESPONSE_WORKING_DAYS,
  type ConsentImpact,
} from "@/lib/privacy-center";
import ConsentLedger, {
  type ConsentGroupView,
  type GrantView,
  type WordingView,
} from "./ConsentLedger";

export const dynamic = "force-dynamic";

type ConsentRow = {
  id: string;
  purpose: string;
  purpose_text: string;
  version: string;
  granted_at: string | null;
  withdrawn_at: string | null;
};

/**
 * Consent dates are legal facts, so they are formatted in the candidate's own
 * timezone (WIB) rather than the server's (UTC on sin1) - see lib/datetime.ts
 * for the same reasoning applied to admin reporting. Formatting server-side
 * also keeps the client component free of any locale/hydration drift.
 */
const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : DATE_FMT.format(d);
}

/** Placement decisions first, then the granular opt-outs, then services. */
const IMPACT_RANK: Record<ConsentImpact, number> = {
  placement: 0,
  granular: 1,
  service: 2,
};

export default async function PrivasiPage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [candRes, consentRes] = await Promise.all([
    supabase
      .from("candidates")
      .select("full_name, email, created_at")
      .eq("id", candidateId)
      .single(),
    // RLS `consents_candidate_read_own` (migration 0001) already scopes this to
    // the signed-in candidate; the explicit .eq() keeps the intent readable and
    // survives any future policy edit.
    supabase
      .from("consents")
      .select("id, purpose, purpose_text, version, granted_at, withdrawn_at")
      .eq("candidate_id", candidateId)
      .order("granted_at", { ascending: false, nullsFirst: false }),
  ]);

  const candidate = candRes.data as {
    full_name: string;
    email: string | null;
    created_at: string;
  } | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared`);

  const rows = (consentRes.data ?? []) as ConsentRow[];
  const groups = buildGroups(rows);
  const activeTotal = groups.reduce((n, g) => n + g.activeCount, 0);

  const memberId = formatMemberId(candidateId, candidate.created_at);
  const requestBody = [
    "Halo tim Perantau Global,",
    "",
    "Saya mau mengajukan permintaan penghapusan data pribadi saya sesuai UU PDP 27/2022.",
    "",
    `Nama: ${candidate.full_name}`,
    `ID Anggota: ${memberId}`,
    `Email akun: ${candidate.email ?? "-"}`,
    "",
    "Terima kasih.",
  ].join("\n");
  const mailtoHref = `mailto:${PDP_REQUEST_EMAIL}?subject=${encodeURIComponent(
    PDP_REQUEST_SUBJECT,
  )}&body=${encodeURIComponent(requestBody)}`;
  const waHref = waLink(
    `Halo Perantau Global, saya mau mengajukan ${PDP_REQUEST_SUBJECT}: penghapusan data pribadi saya. Nama: ${candidate.full_name}. ID Anggota: ${memberId}.`,
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Privasi & data saya" back backHref="/profile" />

      <main className="flex-1 pb-10 px-5 pt-4">
        <p className="text-[13px] text-pg-ink-tertiary mb-5 leading-snug">
          Di sini kamu bisa lihat persetujuan apa aja yang pernah kamu kasih,
          menariknya kapan aja, dan minta datamu dihapus. Semua sesuai UU PDP
          27/2022.
        </p>

        <SectionHead
          title="Persetujuan kamu"
          sub={
            groups.length === 0
              ? "Belum ada catatan"
              : `${activeTotal} aktif dari ${groups.length} jenis`
          }
        />

        {groups.length === 0 ? (
          <EmptyLedger />
        ) : (
          <ConsentLedger groups={groups} />
        )}

        <div className="pt-6">
          <SectionHead
            title="Hapus data saya"
            sub={`Dikerjakan tim kami, dijawab maks. ${PDP_RESPONSE_WORKING_DAYS} hari kerja`}
          />
          <DeletionRequestCard mailtoHref={mailtoHref} waHref={waHref} />
        </div>

        <div className="pt-6">
          <SectionHead title="Hak kamu yang lain" />
          <OtherRightsCard mailtoHref={mailtoHref} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/**
 * Groups the ledger by purpose, then by distinct wording inside each purpose.
 *
 * One row = one grant event, so a candidate with three applications has three
 * identical `application_processing` rows. Showing three identical cards would
 * be noise; collapsing them loses the dates. Grouping by (version, purpose_text)
 * and listing every grant under its wording keeps both: one quoted sentence,
 * every occasion it was agreed to, and a re-quote if the wording ever changed
 * between grants.
 */
function buildGroups(rows: ConsentRow[]): ConsentGroupView[] {
  const byPurpose = new Map<string, ConsentRow[]>();
  for (const row of rows) {
    const list = byPurpose.get(row.purpose);
    if (list) list.push(row);
    else byPurpose.set(row.purpose, [row]);
  }

  const groups: ConsentGroupView[] = [];
  for (const [purpose, purposeRows] of byPurpose) {
    const meta = getConsentMeta(purpose);

    const byWording = new Map<string, WordingView>();
    for (const row of purposeRows) {
      const key = `${row.version}::${row.purpose_text}`;
      const grant: GrantView = {
        grantedLabel: fmtDate(row.granted_at),
        withdrawnLabel: fmtDate(row.withdrawn_at),
      };
      const existing = byWording.get(key);
      if (existing) existing.grants.push(grant);
      else
        byWording.set(key, {
          key,
          text: row.purpose_text,
          version: row.version,
          grants: [grant],
        });
    }

    const withdrawnDates = purposeRows
      .map((r) => r.withdrawn_at)
      .filter((d): d is string => Boolean(d))
      .sort();

    groups.push({
      purpose,
      label: meta.label,
      blurb: meta.blurb,
      icon: meta.icon,
      impact: meta.impact,
      activeCount: purposeRows.filter((r) => !r.withdrawn_at).length,
      totalCount: purposeRows.length,
      lastWithdrawnLabel: fmtDate(withdrawnDates[withdrawnDates.length - 1] ?? null),
      wordings: [...byWording.values()],
    });
  }

  return groups.sort(
    (a, b) =>
      IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact] ||
      a.label.localeCompare(b.label, "id"),
  );
}

function EmptyLedger() {
  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-border)",
      }}
    >
      <span
        className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
        style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-700)" }}
      >
        <Icon name="shield" size={16} stroke={2} />
      </span>
      <p className="text-[12.5px] text-pg-ink-500 leading-snug m-0">
        Belum ada persetujuan yang tercatat di sini. Catatan baru muncul begitu
        kamu melamar lowongan atau daftar kelas Akademi. Persetujuan waktu bikin
        akun tersimpan di akun kamu, bukan di daftar ini.
      </p>
    </div>
  );
}

/**
 * Deletion is NOT automated on purpose. Hard-deleting a candidate would cut
 * across P3MI record-keeping the privacy policy commits to (a successful
 * placement is retained a minimum of 5 years), so the request goes to a human
 * who decides what can go and what must stay. The page says that in as many
 * words rather than implying a button wipes everything.
 */
function DeletionRequestCard({
  mailtoHref,
  waHref,
}: {
  mailtoHref: string;
  waHref: string;
}) {
  const steps = [
    `Emailnya masuk ke tim kami di ${PDP_REQUEST_EMAIL} dengan subjek "${PDP_REQUEST_SUBJECT}", sudah terisi identitas kamu.`,
    `Kami balas paling lama ${PDP_RESPONSE_WORKING_DAYS} hari kerja, sesuai Kebijakan Privasi.`,
    "Kami cek dulu data mana yang bisa dihapus dan mana yang wajib kami simpan karena aturan. Contohnya lamaran yang sudah jadi penempatan: itu wajib kami simpan minimal 5 tahun sebagai P3MI berizin.",
    "Kamu dapat konfirmasi tertulis soal apa yang dihapus dan apa yang tetap disimpan, plus alasannya.",
  ];

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-border)",
        boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="trash" size={16} stroke={2} />
        </span>
        <p className="text-[12.5px] text-pg-ink-700 leading-snug m-0 flex-1">
          Penghapusan data dikerjakan manual sama tim kami, bukan otomatis lewat
          tombol. Alasannya: sebagian data kamu masih terikat kewajiban hukum
          yang jalan, dan sekali terhapus gak bisa dibalikin.
        </p>
      </div>

      <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-pg-ink-500 mt-4 mb-2">
        Setelah kamu kirim
      </div>
      <ol className="m-0 pl-4 flex flex-col gap-1.5 list-decimal">
        {steps.map((s) => (
          <li key={s} className="text-[12.5px] leading-snug text-pg-ink-700">
            {s}
          </li>
        ))}
      </ol>

      <a
        href={mailtoHref}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 min-h-[52px] px-[22px] rounded-xl no-underline font-semibold text-base tracking-tight bg-pg-red-600 text-white"
      >
        <Icon name="mail" size={18} stroke={2.2} />
        Kirim permintaan penghapusan
      </a>
      <p className="text-[11.5px] text-pg-ink-500 leading-snug mt-2 mb-0">
        Tombol ini membuka aplikasi email kamu dengan isi yang sudah disiapkan.
        Kamu masih bisa mengeditnya sebelum mengirim, dan permintaannya baru
        masuk setelah kamu tekan kirim di sana.
      </p>

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl no-underline font-semibold text-[13.5px] border-[1.5px] bg-transparent text-pg-ink-900"
        style={{ borderColor: "var(--pg-ink-200)" }}
      >
        <Icon name="phone" size={16} stroke={2.2} />
        Lebih gampang lewat WhatsApp
      </a>
    </div>
  );
}

function OtherRightsCard({ mailtoHref }: { mailtoHref: string }) {
  const rights = [
    "Mengakses data pribadi yang kami simpan tentang kamu.",
    "Memperbaiki data yang gak akurat atau sudah usang.",
    "Membatasi pemrosesan data tertentu.",
    "Memindahkan data kamu (portabilitas) dalam format yang umum dipakai.",
    "Mengajukan keluhan ke lembaga pengawas perlindungan data di Indonesia.",
  ];

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-border)",
        boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
      }}
    >
      <p className="text-[12.5px] text-pg-ink-700 leading-snug m-0">
        Selain menarik persetujuan dan minta penghapusan, kamu juga berhak:
      </p>
      <ul className="mt-2 mb-0 pl-4 flex flex-col gap-1.5 list-disc">
        {rights.map((r) => (
          <li key={r} className="text-[12.5px] leading-snug text-pg-ink-700">
            {r}
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-pg-ink-500 leading-snug mt-3 mb-0">
        Semuanya lewat jalur yang sama:{" "}
        <a href={mailtoHref} className="font-bold text-pg-ink-900">
          {PDP_REQUEST_EMAIL}
        </a>{" "}
        dengan subjek &ldquo;{PDP_REQUEST_SUBJECT}&rdquo;.
      </p>

      <a
        href={`${WEB_POLICY_ORIGIN}/privacy`}
        target="_blank"
        rel="noreferrer"
        className="mt-3.5 flex items-center gap-3 no-underline"
      >
        <span
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
          style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-700)" }}
        >
          <Icon name="shield" size={16} stroke={2} />
        </span>
        <span className="flex-1 text-[13.5px] font-bold tracking-[-0.005em] text-pg-ink-900">
          Baca Kebijakan Privasi lengkap
        </span>
        <Icon name="chevron_right" size={15} className="text-pg-ink-400 shrink-0" />
      </a>
    </div>
  );
}
