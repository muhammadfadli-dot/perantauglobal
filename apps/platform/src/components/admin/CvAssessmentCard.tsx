import { Icon, type IconName } from "@/components/pg/Icon";

/**
 * CV Assessment card (admin) — renders the AI-extracted CV (cv_assessments)
 * on the candidate detail page: completeness score, code-derived facts
 * (umur / total pengalaman), a structured summary, and a full-parse expander.
 *
 * Fit-to-position scoring (application_cv_fit) is surfaced separately on the
 * application card in a later batch. This card is candidate-level (the CV
 * itself), position-agnostic.
 */

type Experience = {
  posisi: string;
  perusahaan: string | null;
  lokasi: string | null;
  mulai: string | null;
  selesai: string | null;
  deskripsi?: string[];
};
type Certificate = { nama: string; penerbit: string | null; tahun: string | null; sumber?: "cv" | "dokumen" };
type Language = { bahasa: string; level: string | null };

type Parsed = {
  nama: string | null;
  kontak?: { hp: string | null; email: string | null };
  tanggal_lahir: string | null;
  gender: string | null;
  domisili: string | null;
  ringkasan: string | null;
  pengalaman?: Experience[];
  pendidikan?: { sekolah: string; jenjang: string | null; jurusan: string | null; tahun_lulus: string | null }[];
  sertifikat?: Certificate[];
  keahlian?: string[];
  bahasa?: Language[];
};

export type CvAssessment = {
  status: "ok" | "needs_review" | "unreadable" | "error";
  error: string | null;
  quality_score: number | null;
  quality: { skor_kelengkapan: number | null; kekurangan: string[] } | null;
  derived: { umur: number | null; total_pengalaman_tahun: number | null } | null;
  parsed: Parsed | null;
  model: string | null;
  created_at: string;
};

function scoreColor(score: number | null): string {
  if (score === null) return "var(--pg-ink-primary)";
  if (score >= 75) return "var(--pg-ok-soft-fg)";
  if (score >= 50) return "var(--pg-warn-soft-fg)";
  return "var(--pg-err)";
}

export default function CvAssessmentCard({
  a,
  action,
}: {
  a: CvAssessment | null;
  action?: React.ReactNode;
}) {
  // No CV graded yet.
  if (!a) {
    return (
      <Shell>
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>Penilaian CV (AI)</Eyebrow>
          {action}
        </div>
        <div className="text-[12px] text-pg-ink-tertiary py-1.5 italic">
          CV belum dinilai. CV yang diupload otomatis dinilai; atau klik “grade ulang”.
        </div>
      </Shell>
    );
  }

  // CV present but unreadable / errored.
  if (a.status !== "ok") {
    const label =
      a.status === "unreadable"
        ? "CV tidak bisa diunduh / dibaca"
        : a.status === "needs_review"
        ? "CV perlu dicek manual"
        : "Gagal memproses CV";
    return (
      <Shell>
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>Penilaian CV (AI)</Eyebrow>
          {action}
        </div>
        <div className="flex items-start gap-2 text-[12px] py-1" style={{ color: "var(--pg-warn-soft-fg)" }}>
          <Icon name="warn" size={13} className="mt-0.5 shrink-0" />
          <span>{label}. Buka file CV manual untuk review.</span>
        </div>
      </Shell>
    );
  }

  const p = a.parsed ?? ({} as Parsed);
  const score = a.quality_score ?? a.quality?.skor_kelengkapan ?? null;
  const umur = a.derived?.umur ?? null;
  const peng = a.derived?.total_pengalaman_tahun ?? null;
  const kekurangan = a.quality?.kekurangan ?? [];

  return (
    <Shell>
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>Penilaian CV (AI)</Eyebrow>
        {action ?? (
          <span
            className="text-[10px] font-semibold tracking-[0.06em] uppercase"
            style={{ color: "var(--pg-ink-quaternary)", fontFamily: "var(--font-mono)" }}
          >
            otomatis
          </span>
        )}
      </div>

      {/* Score + derived facts */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="text-[30px] font-extrabold leading-[32px] tabular-nums" style={{ color: scoreColor(score) }}>
            {score ?? "—"}
          </div>
          <div
            className="text-[9px] font-semibold tracking-[0.08em] uppercase"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            kelengkapan
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Fact icon="user" label="Umur" value={umur !== null ? `${umur} thn` : "—"} />
          <Fact icon="briefcase" label="Pengalaman" value={peng !== null ? `± ${peng} thn` : "—"} />
        </div>
      </div>

      {/* Quick structured summary */}
      {p.ringkasan && (
        <p className="text-[12px] leading-[1.5] text-pg-ink-secondary line-clamp-3">{p.ringkasan}</p>
      )}

      {(p.keahlian?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1">
          {p.keahlian!.slice(0, 8).map((k, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "var(--pg-paper)", color: "var(--pg-ink-secondary)" }}
            >
              {k}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}>
        <span>{p.pengalaman?.length ?? 0} pengalaman</span>
        <span>·</span>
        <span>{p.sertifikat?.length ?? 0} sertifikat</span>
        <span>·</span>
        <span>{p.bahasa?.length ?? 0} bahasa</span>
      </div>

      {kekurangan.length > 0 && (
        <div className="flex flex-col gap-1 pt-1" style={{ borderTop: "1px solid var(--pg-border-soft)" }}>
          {kekurangan.slice(0, 3).map((k, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: "var(--pg-warn-soft-fg)" }}>
              <Icon name="warn" size={11} className="mt-0.5 shrink-0" />
              <span className="text-pg-ink-tertiary">{k}</span>
            </div>
          ))}
        </div>
      )}

      {/* Full parse expander */}
      <details className="mt-0.5">
        <summary
          className="text-[10px] font-bold tracking-[0.08em] uppercase cursor-pointer"
          style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
        >
          Detail CV
        </summary>
        <div className="mt-2.5 flex flex-col gap-3">
          {(p.pengalaman?.length ?? 0) > 0 && (
            <Section title="Pengalaman">
              {p.pengalaman!.map((e, i) => (
                <div key={i} className="text-[12px]">
                  <div className="font-bold text-pg-ink-primary leading-tight">{e.posisi}</div>
                  <div className="text-pg-ink-tertiary leading-tight">
                    {[e.perusahaan, e.lokasi].filter(Boolean).join(" · ")}
                    {(e.mulai || e.selesai) && (
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {" "}— {e.mulai ?? "?"}–{e.selesai ?? "?"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </Section>
          )}
          {(p.sertifikat?.length ?? 0) > 0 && (
            <Section title="Sertifikat">
              {p.sertifikat!.map((c, i) => (
                <div key={i} className="text-[12px] text-pg-ink-secondary leading-tight flex items-start gap-1.5">
                  <span className="min-w-0">
                    {c.nama}
                    {(c.penerbit || c.tahun) && (
                      <span className="text-pg-ink-tertiary"> — {[c.penerbit, c.tahun].filter(Boolean).join(", ")}</span>
                    )}
                  </span>
                  {c.sumber === "dokumen" && (
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 rounded shrink-0 uppercase tracking-wide"
                      style={{ background: "var(--pg-ok-soft-bg)", color: "var(--pg-ok-soft-fg)" }}
                      title="Didukung dokumen yang diupload"
                    >
                      dok
                    </span>
                  )}
                </div>
              ))}
            </Section>
          )}
          {(p.bahasa?.length ?? 0) > 0 && (
            <Section title="Bahasa">
              <div className="text-[12px] text-pg-ink-secondary">
                {p.bahasa!.map((b) => `${b.bahasa}${b.level ? ` (${b.level})` : ""}`).join(" · ")}
              </div>
            </Section>
          )}
        </div>
      </details>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3" style={{ border: "1px solid var(--pg-border)" }}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] font-semibold tracking-[0.12em] leading-[12px] uppercase"
      style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <Icon name={icon} size={13} className="text-pg-ink-quaternary shrink-0" />
      <span className="text-pg-ink-tertiary">{label}</span>
      <span className="font-bold text-pg-ink-primary ml-auto tabular-nums">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="text-[9px] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--pg-ink-quaternary)", fontFamily: "var(--font-mono)" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
