import Link from "next/link";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-static";

export default function PasporComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Paspor Perantau Global" back backHref="/dashboard" />

      <main className="flex-1 pb-12 px-5 pt-6">
        {/* Hero card — same amber treatment as dashboard card */}
        <section
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #fffaef 0%, var(--pg-amber-100) 60%, #fce8b6 100%)",
            border: "1px solid var(--pg-amber-200)",
            boxShadow:
              "0 6px 18px rgba(201,138,20,0.20), 0 12px 36px rgba(201,138,20,0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              top: 0, left: 0, right: 0, height: "50%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-40px", right: "-40px",
              width: "140px", height: "140px",
              background:
                "radial-gradient(circle, var(--pg-amber-500) 0%, transparent 70%)",
              opacity: 0.16,
            }}
          />

          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--pg-amber-500) 0%, var(--pg-amber-600) 100%)",
                boxShadow:
                  "0 3px 10px rgba(201,138,20,0.40), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M12 2L9 7l-5.5.8L7.5 12l-1 5.5L12 15l5.5 2.5-1-5.5 4-4.2L15 7z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em] font-mono"
                style={{ color: "var(--pg-amber-700)" }}
              >
                Paspor Perantau Global
              </span>
              <span
                className="text-[9px] font-extrabold uppercase tracking-[0.08em] px-2 py-0.5 rounded font-mono text-white"
                style={{ background: "var(--pg-amber-700)" }}
              >
                Segera Hadir
              </span>
            </div>

            <h1
              className="text-[28px] font-extrabold tracking-[-0.025em] mt-3 leading-tight"
              style={{ color: "var(--pg-amber-700)" }}
            >
              Sertifikasi Siap Kerja
            </h1>
            <p className="text-[14px] mt-3 leading-relaxed" style={{ color: "var(--pg-ink-secondary)" }}>
              Kursus singkat gratis dari Perantau Global, dirancang khusus buat
              kamu yang akan berangkat ke luar negeri. Bukan soal teknis kerja —
              tapi soal <strong>bagaimana tahan dan sukses</strong> di sana.
            </p>
          </div>
        </section>

        {/* What's in it */}
        <section className="mt-6">
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-3 font-mono"
            style={{ color: "var(--pg-red-600)" }}
          >
            Yang akan kamu pelajari
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              {
                title: "Etika & budaya kerja di destinasi",
                body: "Norma kerja, hubungan dengan atasan, hari libur, etika religius. Khusus per negara.",
              },
              {
                title: "Bahasa praktis di tempat kerja",
                body: "Frasa harian yang kamu pakai 90% waktu. Bukan grammar, tapi yang langsung kepake.",
              },
              {
                title: "Adaptasi hidup di negara tujuan",
                body: "Cuaca, makanan, transport, bersosial. Tips dari pekerja Indonesia yang sudah pengalaman.",
              },
              {
                title: "Cara kelola gaji & kirim ke keluarga",
                body: "Remitansi, banking, save & invest. Biar gaji nggak habis tanpa hasil.",
              },
              {
                title: "Hak pekerja & cara cari bantuan",
                body: "Kontak konsulat, KBRI, agency representative kalau ada masalah.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-pg-white rounded-2xl p-4"
                style={{
                  border: "1px solid var(--pg-border)",
                  boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 16px rgba(20,20,20,0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full grid place-items-center text-white shrink-0 mt-0.5"
                    style={{
                      background: "var(--pg-amber-500)",
                      boxShadow: "0 1px 3px rgba(201,138,20,0.4)",
                    }}
                  >
                    <Icon name="check" size={12} stroke={3} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-extrabold tracking-[-0.01em] text-pg-ink-primary">
                      {item.title}
                    </div>
                    <div className="text-[13px] mt-1 leading-snug" style={{ color: "var(--pg-ink-secondary)" }}>
                      {item.body}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming soon notice */}
        <section className="mt-6">
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: "var(--pg-surface-subtle)",
              border: "1px dashed var(--pg-ink-200)",
            }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.14em] font-mono mb-2"
              style={{ color: "var(--pg-ink-tertiary)" }}
            >
              Segera Hadir
            </div>
            <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-pg-ink-primary">
              Lagi disiapkan tim Perantau Global
            </h2>
            <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--pg-ink-secondary)" }}>
              Konten kursus pertama (Saudi Arabia & Jepang) lagi disusun. Kami
              kabari lewat WhatsApp & email begitu siap. Sambil nunggu, lanjutin
              proses lamaran kamu.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 mt-4 rounded-xl text-[13px] font-bold no-underline text-white"
              style={{ background: "var(--pg-red-600)" }}
            >
              Kembali ke beranda
              <Icon name="arrow_right" size={14} stroke={2.5} />
            </Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
