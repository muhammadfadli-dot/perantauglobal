import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { EnrollmentPaymentActions } from "@/components/admin/EnrollmentPaymentActions";

export const dynamic = "force-dynamic";

const PAYMENT_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  paid: { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)", label: "Lunas" },
  waived: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)", label: "Waived" },
  pending: { bg: "var(--pg-warn-bg)", fg: "var(--pg-warn)", label: "Pending" },
  unpaid: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)", label: "Belum bayar" },
  refunded: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)", label: "Refund" },
};

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum bayar" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Lunas" },
  { key: "waived", label: "Waived" },
] as const;

type Row = {
  id: string;
  program_slug: string;
  payment_status: string;
  payment_amount: number | null;
  payment_ref: string | null;
  payment_channel: string | null;
  paid_at: string | null;
  status: string;
  enrolled_at: string;
  candidates: { full_name: string | null; email: string | null; phone: string | null } | null;
  academy_programs: { title: string; price: number | null; is_free: boolean } | null;
};

const rupiah = (n: number | null | undefined) =>
  n == null ? "—" : `Rp${n.toLocaleString("id-ID")}`;

export default async function AdminAcademyPage({
  searchParams,
}: {
  searchParams: Promise<{ bayar?: string }>;
}) {
  const { bayar } = await searchParams;
  const filter = FILTERS.some((f) => f.key === bayar) ? (bayar as string) : "all";
  const supabase = await createServerClient();

  const base = supabase
    .from("academy_enrollments")
    .select(
      "id, program_slug, payment_status, payment_amount, payment_ref, payment_channel, paid_at, status, enrolled_at, candidates(full_name, email, phone), academy_programs(title, price, is_free)",
    )
    .order("enrolled_at", { ascending: false })
    .limit(500);
  const { data, error } =
    filter === "all" ? await base : await base.eq("payment_status", filter);

  if (error) {
    return (
      <main className="p-6 lg:p-10 max-w-5xl">
        <p className="text-sm text-pg-err">Query gagal: {error.message}</p>
        <p className="text-[13px] text-pg-ink-500 mt-2">
          Kalau ini soal kolom <code className="font-mono">payment_status</code>,
          migration <code className="font-mono">0084_academy_payment.sql</code> belum di-apply.
        </p>
      </main>
    );
  }

  const [paidC, pendingC, unpaidC, paidRows] = await Promise.all([
    supabase.from("academy_enrollments").select("*", { count: "exact", head: true }).eq("payment_status", "paid"),
    supabase.from("academy_enrollments").select("*", { count: "exact", head: true }).eq("payment_status", "pending"),
    supabase.from("academy_enrollments").select("*", { count: "exact", head: true }).eq("payment_status", "unpaid"),
    supabase.from("academy_enrollments").select("payment_amount").eq("payment_status", "paid").limit(1000),
  ]);
  const revenue = (paidRows.data ?? []).reduce(
    (s, r) => s + ((r as { payment_amount: number | null }).payment_amount ?? 0),
    0,
  );

  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Admin / Akademi
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
        Pendaftaran &amp; pembayaran
      </h1>
      <p className="text-base text-pg-ink-700 mt-2 leading-relaxed max-w-2xl">
        Kelola pembayaran kelas berbayar (Paspor PG). Konfirmasi pembayaran manual
        (transfer/WA) lewat <b>Tandai lunas</b>, atau bebaskan biaya dengan <b>Waive</b>.
      </p>

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Lunas" value={String(paidC.count ?? 0)} tone="var(--pg-ok)" />
        <Kpi label="Pending" value={String(pendingC.count ?? 0)} tone="var(--pg-warn)" />
        <Kpi label="Belum bayar" value={String(unpaidC.count ?? 0)} tone="var(--pg-ink-700)" />
        <Kpi label="Pendapatan (lunas)" value={rupiah(revenue)} tone="var(--pg-red-600)" />
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/academy" : `/admin/academy?bayar=${f.key}`}
              className="px-3.5 py-2 rounded-full text-[12.5px] font-bold no-underline transition-colors"
              style={{
                background: active ? "var(--pg-red-600)" : "var(--pg-white)",
                color: active ? "#fff" : "var(--pg-ink-secondary)",
                border: active ? "1px solid var(--pg-red-600)" : "1px solid var(--pg-ink-200)",
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="mt-5 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-base font-bold">Belum ada pendaftaran</div>
            <div className="text-sm text-pg-ink-500 mt-1.5">
              Pendaftaran kelas berbayar akan muncul di sini begitu kandidat mendaftar.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px]">
              <thead>
                <tr style={{ background: "var(--pg-ink-50)" }}>
                  <Th>Kandidat</Th>
                  <Th>Program</Th>
                  <Th>Pembayaran</Th>
                  <Th>Nominal</Th>
                  <Th>Daftar</Th>
                  <Th right>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tone = PAYMENT_TONE[r.payment_status] ?? PAYMENT_TONE.unpaid!;
                  const isPaidProgram = r.academy_programs ? !r.academy_programs.is_free : true;
                  const needsAction =
                    isPaidProgram && (r.payment_status === "unpaid" || r.payment_status === "pending");
                  const amount = r.payment_amount ?? r.academy_programs?.price ?? null;
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid var(--pg-ink-100)" }}>
                      <Td>
                        <div className="font-semibold text-pg-ink-900 truncate max-w-[200px]">
                          {r.candidates?.full_name ?? "—"}
                        </div>
                        <div className="text-[11.5px] text-pg-ink-500 truncate max-w-[200px]">
                          {r.candidates?.phone ?? r.candidates?.email ?? ""}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-pg-ink-800 truncate max-w-[220px]">
                          {r.academy_programs?.title ?? r.program_slug}
                        </div>
                        {r.payment_ref && (
                          <div className="text-[10.5px] font-mono text-pg-ink-400 truncate max-w-[220px]">
                            {r.payment_ref}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wide"
                          style={{ background: tone.bg, color: tone.fg }}
                        >
                          {tone.label}
                        </span>
                        {r.paid_at && (
                          <div className="text-[10.5px] text-pg-ink-400 mt-0.5">
                            {new Date(r.paid_at).toLocaleDateString("id-ID")}
                            {r.payment_channel ? ` · ${r.payment_channel}` : ""}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <span className="font-mono text-[13px] text-pg-ink-800">
                          {r.academy_programs?.is_free ? "Gratis" : rupiah(amount)}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-[12px] text-pg-ink-500">
                          {new Date(r.enrolled_at).toLocaleDateString("id-ID")}
                        </span>
                      </Td>
                      <Td right>
                        {needsAction ? (
                          <EnrollmentPaymentActions enrollmentId={r.id} />
                        ) : (
                          <span className="text-[11.5px] text-pg-ink-400">—</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rows.length >= 500 && (
        <p className="text-[12px] text-pg-ink-400 mt-3">
          Menampilkan 500 terbaru. Pagination menyusul kalau volume bertambah.
        </p>
      )}
    </main>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4">
      <div className="text-[11px] font-bold uppercase tracking-wide text-pg-ink-500">{label}</div>
      <div className="text-[22px] font-extrabold tabular-nums mt-1" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-pg-ink-500 ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <td className={`px-4 py-3 align-top ${right ? "text-right" : "text-left"}`}>{children}</td>;
}
