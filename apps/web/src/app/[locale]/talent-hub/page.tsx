import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { TrustStrip } from "@/components/pg/TrustStrip";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { POSITIONS } from "@/lib/positions";

export const metadata: Metadata = {
  title: "Talent Hub — Aplikasi Perantau Global",
  description:
    "Talent Hub adalah aplikasi Perantau Global tempat kamu apply lowongan kerja luar negeri, lengkapi profil sekali, pantau status lamaran real-time. Gratis daftar, PIC dampingi via WhatsApp.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, "") || "6281200000000";

/** Reusable iPhone-style bezel + dynamic island wrapper for the hero phone mockups. */
function PhoneFrame({
  children,
  width = 272,
  height = 560,
}: {
  children: React.ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #2a2a2a 0%, #0e0e0e 100%)",
        padding: 8,
        borderRadius: 38,
        border: "1px solid #3a3a3a",
        width,
      }}
    >
      <div
        className="relative overflow-hidden bg-white"
        style={{ borderRadius: 32, height }}
      >
        {/* Dynamic island */}
        <div className="relative pt-2.5 flex justify-center">
          <div
            style={{
              width: 78,
              height: 22,
              background: "#0e0e0e",
              borderRadius: 999,
            }}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

/** Static iOS-style status bar (time + signal + battery) rendered inside PhoneFrame. */
function PhoneStatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-1.5 text-[10px] font-bold text-pg-ink-700">
      <span>09:24</span>
      <div className="flex items-center gap-1">
        <svg width="13" height="9" viewBox="0 0 14 10" fill="currentColor" aria-hidden>
          <rect x="0" y="6" width="2.5" height="3.5" rx="0.5" />
          <rect x="3.5" y="4" width="2.5" height="5.5" rx="0.5" />
          <rect x="7" y="2" width="2.5" height="7.5" rx="0.5" />
          <rect x="10.5" y="0" width="2.5" height="9.5" rx="0.5" />
        </svg>
        <span className="text-[8.5px]">5G</span>
        <svg width="16" height="9" viewBox="0 0 18 10" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="0.8" />
          <rect x="2" y="2" width="9" height="6" rx="1" fill="currentColor" />
          <rect x="15" y="3" width="1.5" height="4" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}


const STEPS = [
  {
    n: "01",
    bg: "var(--pg-red-600)",
    glow: "rgba(215,38,47,0.30)",
    eta: "~2 menit",
    title: "Daftar akun",
    desc: "Nama, email, password. Kami kirim link verifikasi ke email — klik untuk aktivasi.",
  },
  {
    n: "02",
    bg: "var(--pg-amber-500)",
    glow: "rgba(201,138,20,0.30)",
    eta: "~5 menit",
    title: "Lengkapi profil",
    desc: "Data diri, dokumen (KTP, paspor, foto, CV), kualifikasi. Sekali isi, dipakai untuk semua lamaran ke depan.",
  },
  {
    n: "03",
    bg: "var(--ok)",
    glow: "rgba(15,138,74,0.30)",
    eta: "~3 menit per posisi",
    title: "Apply lowongan",
    desc: "Pilih posisi yang cocok, jawab pertanyaan tambahan spesifik posisi, kirim. Status real-time di Lamaran kamu.",
  },
];

const FAQS = [
  {
    q: "Apakah daftar Talent Hub berbayar?",
    a: "Tidak. Daftar Talent Hub gratis. Kamu juga bebas biaya sebelum terima offering letter dari employer. Biaya keberangkatan (Rp 15-25 jt untuk dokumen MCU, paspor, apostille) baru muncul setelah kamu diterima.",
    open: true,
  },
  {
    q: "Saya harus pakai password?",
    a: "Iya, password supaya akun kamu aman. Kami kirim email verifikasi pertama kali. Selanjutnya tinggal masuk pakai email + password. Lupa password? Tinggal klik “Lupa password” di halaman masuk.",
    open: true,
  },
  {
    q: "1 akun bisa apply ke banyak posisi?",
    a: "Iya. Lengkapi profil sekali, dipakai untuk semua lamaran ke depan. Tiap apply, kamu cuma jawab pertanyaan spesifik posisi itu (misal pengalaman barista, SIM untuk truck driver).",
    open: true,
  },
  {
    q: "Apakah data saya aman? PDP UU 27/2022?",
    a: "Iya. Kami simpan data sesuai UU 27/2022 Perlindungan Data Pribadi: enkripsi at-rest, akses dibatasi ke tim recruiter & PIC saja, dan kamu bisa minta hapus akun kapan saja.",
  },
  {
    q: "Status lamaran lama nggak berubah, gimana?",
    a: "Tahap proses berbeda lama nya. Wawancara biasanya 1-3 minggu, dokumen 1-2 bulan. Kalau lebih dari estimasi tanpa update, chat PIC via WhatsApp — tombol ada di setiap halaman lamaran.",
  },
];

export default async function TalentHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <>
      <TrustStrip />
      <main>
        {/* HERO — centered copy on top, 3 phone mockups below, red eclipse bg */}
        <section className="relative overflow-hidden text-center px-5 md:px-8 pt-12 md:pt-20 pb-12 md:pb-20">
          {/* Red eclipse — half-moon blur sitting behind the phone row */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 -z-10 pointer-events-none"
            style={{
              bottom: "5%",
              width: "min(130%, 1400px)",
              aspectRatio: "2.2/1",
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 100%, rgba(215,38,47,0.85) 0%, rgba(215,38,47,0.45) 22%, rgba(215,38,47,0.18) 38%, rgba(215,38,47,0.04) 55%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
          </div>

          {/* Centered copy block */}
          <div className="max-w-3xl mx-auto relative">
            <div className="text-[11px] md:text-[12px] font-bold tracking-[0.22em] uppercase text-pg-red-600 font-mono mb-5">
              Aplikasi Perantau Global
            </div>
            <h1 className="text-[40px] md:text-[64px] font-extrabold leading-[1.02] tracking-[-0.035em]">
              Talent Hub.
              <br />
              Pintu kerja luar negeri kamu.
            </h1>
            <p className="text-base md:text-[17px] text-pg-ink-700 leading-relaxed mt-5 max-w-prose mx-auto">
              Tempat kamu apply lowongan, lengkapi profil sekali pakai untuk
              semua lamaran, dan pantau status real-time. Gratis daftar,
              dampingan PIC via WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-7 max-w-md mx-auto">
              <a
                href={APP_URL}
                className="inline-flex flex-1 items-center justify-center gap-2 min-h-[52px] px-5 text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                style={{
                  background: "var(--pg-red-600)",
                  boxShadow: "0 3px 10px rgba(215,38,47,0.30)",
                }}
              >
                Daftar di Talent Hub <Icon name="arrow_right" size={18} />
              </a>
              <a
                href={`${APP_URL}/auth/sign-in`}
                className="inline-flex flex-1 items-center justify-center gap-2 min-h-[52px] px-5 text-base font-bold rounded-2xl text-pg-ink-900 bg-white border border-pg-ink-100 no-underline transition-all hover:bg-pg-paper"
              >
                Sudah punya akun? Masuk
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {[
                { dot: "var(--ok)", label: "Gratis daftar" },
                { dot: "var(--pg-amber-500)", label: "Email verifikasi" },
                { dot: "var(--pg-red-600)", label: "~2 menit setup" },
              ].map((k, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-pg-ink-100"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: k.dot }}
                  />
                  <span className="text-[11px] font-semibold tracking-wide font-mono">
                    {k.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 phone mockups row */}
          <div className="relative mt-14 md:mt-20 flex items-end justify-center md:gap-4 lg:gap-6">
            {/* LEFT phone: Lowongan list (hidden on mobile) */}
            <div
              className="hidden md:block relative flex-shrink-0"
              style={{
                transform: "rotate(-7deg) translateY(20px)",
                zIndex: 1,
                filter:
                  "drop-shadow(0 20px 40px rgba(20,20,20,0.18)) drop-shadow(0 6px 12px rgba(20,20,20,0.10))",
                marginRight: -32,
              }}
            >
              <PhoneFrame height={520} width={244}>
                <PhoneStatusBar />
                <div className="px-4 pt-3 pb-2 text-left">
                  <div className="text-[9.5px] text-pg-ink-500 font-semibold">
                    Lowongan terbuka
                  </div>
                  <div className="text-[14px] font-extrabold leading-tight">
                    Pilih posisi
                  </div>
                </div>
                <div className="px-4 flex gap-1 pb-2">
                  {["Semua", "Saudi", "Jepang"].map((c, i) => (
                    <span
                      key={c}
                      className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                        i === 0
                          ? "bg-pg-ink-900 text-white"
                          : "bg-pg-ink-100 text-pg-ink-700"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="px-4 flex flex-col gap-1.5 text-left">
                  {(
                    [
                      {
                        flag: "🇸🇦",
                        role: "Perawat",
                        salary: "SAR 3.200",
                        tone: "green",
                        label: "Lagi buka",
                      },
                      {
                        flag: "🇯🇵",
                        role: "Truck Driver",
                        salary: "¥ 240rb",
                        tone: "green",
                        label: "Lagi buka",
                      },
                      {
                        flag: "🇹🇼",
                        role: "Caregiver",
                        salary: "NT$ 29.500",
                        tone: "amber",
                        label: "Antrian",
                      },
                      {
                        flag: "🇸🇦",
                        role: "Barista",
                        salary: "SAR 2.500",
                        tone: "green",
                        label: "Lagi buka",
                      },
                    ] as const
                  ).map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-pg-ink-100 bg-white p-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px]">{p.flag}</span>
                          <span className="text-[11px] font-bold tracking-tight">
                            {p.role}
                          </span>
                        </div>
                        <span
                          className="text-[7.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                          style={
                            p.tone === "green"
                              ? {
                                  background: "rgba(15,138,74,0.10)",
                                  color: "#0a6e3a",
                                }
                              : {
                                  background: "rgba(201,138,20,0.12)",
                                  color: "#8a5e0a",
                                }
                          }
                        >
                          {p.label}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span
                          className="text-[12px] font-extrabold"
                          style={{ color: "var(--pg-red-600)" }}
                        >
                          {p.salary}
                        </span>
                        <span className="text-[8px] text-pg-ink-500">
                          /bulan
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </PhoneFrame>
            </div>

            {/* CENTER phone: Status tracker (hero, always visible) */}
            <div
              className="relative flex-shrink-0"
              style={{
                zIndex: 3,
                filter:
                  "drop-shadow(0 30px 60px rgba(20,20,20,0.20)) drop-shadow(0 8px 16px rgba(20,20,20,0.12))",
              }}
            >
              <PhoneFrame height={560} width={272}>
                <PhoneStatusBar />
                <div className="flex items-center gap-2.5 px-4 pt-3 pb-1 text-left">
                  <div
                    className="w-8 h-8 rounded-full grid place-items-center text-white font-extrabold text-[13px] flex-shrink-0"
                    style={{ background: "var(--pg-red-600)" }}
                  >
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9.5px] text-pg-ink-500 font-semibold leading-tight">
                      Hai, Sari 👋
                    </div>
                    <div className="text-[14px] font-extrabold tracking-tight leading-tight">
                      Lamaran kamu
                    </div>
                  </div>
                </div>
                <div className="mx-4 mt-2.5 p-2.5 rounded-xl border border-pg-ink-100 bg-pg-paper text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9.5px] font-bold text-pg-ink-700">
                      Profil siap apply
                    </span>
                    <span
                      className="text-[11px] font-extrabold"
                      style={{ color: "var(--pg-red-600)" }}
                    >
                      78%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-pg-ink-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "78%",
                        background: "linear-gradient(90deg, #d7262f, #b81d26)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 mt-3 mb-2">
                  <span className="text-[8.5px] font-bold tracking-[0.18em] uppercase text-pg-ink-500 font-mono">
                    Lamaran aktif
                  </span>
                  <span className="text-[9px] font-semibold text-pg-ink-500">
                    3 berjalan
                  </span>
                </div>
                <div className="px-4 flex flex-col gap-1.5 text-left">
                  {(
                    [
                      {
                        flag: "🇸🇦",
                        role: "Perawat",
                        city: "Riyadh",
                        stage: 3,
                        label: "Wawancara",
                        tone: "green",
                      },
                      {
                        flag: "🇯🇵",
                        role: "Truck Driver",
                        city: "Osaka",
                        stage: 2,
                        label: "Diseleksi",
                        tone: "green",
                      },
                      {
                        flag: "🇹🇼",
                        role: "Caregiver",
                        city: "Taipei",
                        stage: 1,
                        label: "Antrian",
                        tone: "amber",
                      },
                    ] as const
                  ).map((a, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-pg-ink-100 bg-white p-2"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[11px]">{a.flag}</span>
                          <span className="text-[11px] font-bold tracking-tight truncate">
                            {a.role}
                          </span>
                          <span className="text-[9.5px] text-pg-ink-500 truncate">
                            · {a.city}
                          </span>
                        </div>
                        <span
                          className="text-[7.5px] font-bold tracking-widest uppercase font-mono px-1.5 py-0.5 rounded-full whitespace-nowrap"
                          style={
                            a.tone === "green"
                              ? {
                                  background: "rgba(15,138,74,0.10)",
                                  color: "#0a6e3a",
                                }
                              : {
                                  background: "rgba(201,138,20,0.12)",
                                  color: "#8a5e0a",
                                }
                          }
                        >
                          {a.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2, 3].map((dotIdx) => {
                          const filled = dotIdx < a.stage;
                          const tone =
                            a.tone === "green" ? "#0a6e3a" : "#c98a14";
                          return (
                            <div
                              key={dotIdx}
                              className="flex items-center gap-1.5 flex-1"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: filled
                                    ? tone
                                    : "rgba(14,14,14,0.12)",
                                }}
                              />
                              {dotIdx < 3 && (
                                <span
                                  className="flex-1 h-px"
                                  style={{
                                    background:
                                      dotIdx < a.stage - 1
                                        ? tone
                                        : "rgba(14,14,14,0.08)",
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Bottom tab bar */}
                <div
                  className="absolute bottom-0 inset-x-0 flex items-stretch justify-around pt-1 pb-4 bg-white"
                  style={{ borderTop: "1px solid rgba(14,14,14,0.06)" }}
                >
                  {(
                    [
                      { icon: "home", label: "Home", active: false },
                      { icon: "file", label: "Lamaran", active: true },
                      { icon: "user", label: "Profil", active: false },
                      { icon: "wa", label: "PIC", active: false },
                    ] as const
                  ).map((t) => (
                    <div
                      key={t.label}
                      className="flex flex-col items-center gap-0.5 flex-1 py-1"
                      style={{
                        color: t.active ? "var(--pg-red-600)" : "#7a7a7a",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={t.active ? 2.4 : 2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        {t.icon === "home" && (
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2z" />
                        )}
                        {t.icon === "file" && (
                          <>
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M9 13h6M9 17h4" />
                          </>
                        )}
                        {t.icon === "user" && (
                          <>
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21v-1a7 7 0 0114 0v1" />
                          </>
                        )}
                        {t.icon === "wa" && (
                          <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" />
                        )}
                      </svg>
                      <span className="text-[7.5px] font-bold tracking-tight">
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>
              </PhoneFrame>
            </div>

            {/* RIGHT phone: PIC WhatsApp chat (hidden on mobile) */}
            <div
              className="hidden md:block relative flex-shrink-0"
              style={{
                transform: "rotate(7deg) translateY(20px)",
                zIndex: 1,
                filter:
                  "drop-shadow(0 20px 40px rgba(20,20,20,0.18)) drop-shadow(0 6px 12px rgba(20,20,20,0.10))",
                marginLeft: -32,
              }}
            >
              <PhoneFrame height={520} width={244}>
                <PhoneStatusBar />
                <div
                  className="flex items-center gap-2 px-4 pt-3 pb-2.5 text-left"
                  style={{ borderBottom: "1px solid rgba(14,14,14,0.06)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full grid place-items-center text-white font-extrabold text-[12px] flex-shrink-0"
                    style={{ background: "#25D366" }}
                  >
                    R
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] font-extrabold leading-tight">
                      Mbak Rina (PIC)
                    </div>
                    <div className="text-[8.5px] text-pg-ink-500 flex items-center gap-1 mt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#0a6e3a" }}
                      />
                      Online · balas &lt; 1 jam
                    </div>
                  </div>
                </div>
                <div className="px-3 py-3 flex flex-col gap-1.5 text-left">
                  <div className="flex items-start max-w-[82%]">
                    <div className="rounded-2xl rounded-tl-md bg-pg-ink-100 px-2.5 py-1.5">
                      <div className="text-[10px] text-pg-ink-900 leading-snug">
                        Halo kak Sari! Surat panggilan wawancara udah saya kirim
                        ke email kamu 📩
                      </div>
                    </div>
                  </div>
                  <div className="text-[7.5px] text-pg-ink-500 ml-1">09:18</div>
                  <div className="flex items-start max-w-[82%] self-end">
                    <div
                      className="rounded-2xl rounded-tr-md text-white px-2.5 py-1.5"
                      style={{ background: "var(--pg-red-600)" }}
                    >
                      <div className="text-[10px] leading-snug">
                        Sip kak, langsung saya cek. Wawancara Senin masih oke?
                      </div>
                    </div>
                  </div>
                  <div className="text-[7.5px] text-pg-ink-500 mr-1 self-end">
                    09:23
                  </div>
                  <div className="flex items-start max-w-[82%]">
                    <div className="rounded-2xl rounded-tl-md bg-pg-ink-100 px-2.5 py-1.5">
                      <div className="text-[10px] text-pg-ink-900 leading-snug">
                        Iya kak, jam 14:00 di kantor. Saya kirim alamat
                        sekarang.
                      </div>
                    </div>
                  </div>
                </div>
                {/* Input bar */}
                <div
                  className="absolute bottom-0 inset-x-0 p-2.5 bg-white"
                  style={{ borderTop: "1px solid rgba(14,14,14,0.06)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-8 rounded-full bg-pg-ink-100 px-3 flex items-center">
                      <span className="text-[9.5px] text-pg-ink-500">
                        Ketik pesan…
                      </span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full grid place-items-center"
                      style={{ background: "var(--pg-red-600)" }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="white"
                        aria-hidden
                      >
                        <path d="M2 22l20-10L2 2v8l14 2-14 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </PhoneFrame>
            </div>
          </div>
        </section>

        {/* FITUR 1 — Job Portal (text left, visual right) */}
        <section className="px-5 md:px-8 py-16 md:py-24 bg-white border-y border-pg-ink-100">
          <div className="max-w-6xl mx-auto md:grid md:grid-cols-[1fr_1fr] md:gap-14 md:items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 text-[11px] md:text-[12px] font-bold tracking-[0.22em] uppercase font-mono mb-5 px-3 py-1.5 rounded-full"
                style={{
                  color: "var(--pg-red-600)",
                  background: "var(--pg-red-50)",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-red-600)" }}
                />
                Fitur 1 · Job Portal
              </div>
              <h2 className="text-[30px] md:text-[48px] font-extrabold tracking-[-0.03em] leading-[1.05]">
                Tempat lowongan kerja{" "}
                <span style={{ color: "var(--pg-red-600)" }}>luar negeri</span>{" "}
                yang resmi.
              </h2>
              <p className="text-[15px] md:text-[17px] text-pg-ink-700 leading-relaxed mt-5">
                Lowongan dari Saudi Arabia, Jepang, Taiwan, dan Indonesia —
                semua dari employer resmi yang sudah verified P3MI. Apply ke
                beberapa posisi sekaligus dengan satu profil, pantau status
                lamaran kamu real-time.
              </p>
              <ul className="flex flex-col gap-3 mt-7">
                {[
                  {
                    title: "Lowongan resmi P3MI",
                    body: "Setiap job order kami konfirmasi langsung ke employer. Bukan calo, bukan agen luar.",
                  },
                  {
                    title: "1 profil, semua lamaran",
                    body: "Lengkapi profil + dokumen sekali. Apply ke posisi cocok di Saudi, Jepang, Taiwan — tanpa upload ulang.",
                  },
                  {
                    title: "Pantau status lamaran real-time",
                    body: "Setiap tahap (Terkirim → Diproses → Wawancara → Hasil) update langsung di Talent Hub. PIC kabari via WhatsApp.",
                  },
                ].map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <span
                      className="w-7 h-7 rounded-full grid place-items-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "var(--pg-red-50)",
                        color: "var(--pg-red-600)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] md:text-[16px] font-bold tracking-tight">
                        {b.title}
                      </span>
                      <span className="text-[13.5px] md:text-[14.5px] text-pg-ink-600 leading-relaxed">
                        {b.body}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/lowongan"
                className="inline-flex items-center gap-2 mt-8 min-h-[48px] px-5 text-sm md:text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                style={{
                  background: "var(--pg-red-600)",
                  boxShadow: "0 3px 10px rgba(215,38,47,0.30)",
                }}
              >
                Lihat semua {POSITIONS.length} lowongan
                <Icon name="arrow_right" size={16} />
              </Link>
            </div>

            {/* Visual: country grid + mini position cards */}
            <div className="mt-10 md:mt-0 relative">
              <div
                aria-hidden
                className="absolute -top-10 -right-10 w-72 h-72 rounded-full pointer-events-none -z-10"
                style={{
                  background:
                    "radial-gradient(circle, rgba(215,38,47,0.16), transparent 65%)",
                  filter: "blur(20px)",
                }}
              />
              <div
                className="relative bg-white rounded-3xl p-5 md:p-7"
                style={{
                  border: "1px solid rgba(14,14,14,0.08)",
                  boxShadow:
                    "0 1px 0 rgba(14,14,14,0.04), 0 16px 40px rgba(14,14,14,0.08)",
                }}
              >
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {(
                    [
                      { flag: "🇸🇦", name: "Saudi" },
                      { flag: "🇯🇵", name: "Jepang" },
                      { flag: "🇹🇼", name: "Taiwan" },
                      { flag: "🇮🇩", name: "Indonesia" },
                    ] as const
                  ).map((c) => (
                    <div
                      key={c.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                      style={{
                        background: "var(--pg-paper)",
                        border: "1px solid rgba(14,14,14,0.08)",
                      }}
                    >
                      <span className="text-[14px]">{c.flag}</span>
                      <span className="text-[11.5px] font-bold tracking-tight">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] uppercase font-mono mb-3"
                  style={{ color: "#5a5a5a" }}
                >
                  Lowongan unggulan
                </div>
                <div className="flex flex-col gap-2.5">
                  {(
                    [
                      {
                        flag: "🇸🇦",
                        role: "Perawat",
                        city: "Riyadh",
                        salary: "SAR 3.200",
                        status: "Lagi buka",
                        tone: "green" as const,
                      },
                      {
                        flag: "🇯🇵",
                        role: "Truck Driver",
                        city: "Osaka",
                        salary: "¥ 240rb",
                        status: "Lagi buka",
                        tone: "green" as const,
                      },
                      {
                        flag: "🇹🇼",
                        role: "Caregiver",
                        city: "Taipei",
                        salary: "NT$ 29.500",
                        status: "Antrian",
                        tone: "amber" as const,
                      },
                    ] as const
                  ).map((j, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white p-3 md:p-3.5"
                      style={{ border: "1px solid rgba(14,14,14,0.06)" }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[15px]">{j.flag}</span>
                          <div className="flex flex-col leading-tight min-w-0">
                            <span className="text-[13.5px] md:text-[14px] font-extrabold tracking-tight truncate">
                              {j.role}
                            </span>
                            <span className="text-[10.5px] md:text-[11px] text-pg-ink-500 truncate">
                              {j.city}
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-[9px] font-bold tracking-widest uppercase font-mono px-2 py-1 rounded-full whitespace-nowrap"
                          style={
                            j.tone === "green"
                              ? {
                                  background: "rgba(15,138,74,0.10)",
                                  color: "#0a6e3a",
                                }
                              : {
                                  background: "rgba(201,138,20,0.12)",
                                  color: "#8a5e0a",
                                }
                          }
                        >
                          {j.status}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-[16px] md:text-[18px] font-extrabold tracking-tight"
                          style={{ color: "var(--pg-red-600)" }}
                        >
                          {j.salary}
                        </span>
                        <span className="text-[11px] text-pg-ink-500">
                          /bulan
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-pg-ink-100 flex items-center justify-between">
                  <span className="text-[11px] md:text-[12px] text-pg-ink-500 font-semibold">
                    + {Math.max(0, POSITIONS.length - 3)} lowongan lainnya
                  </span>
                  <Link
                    href="/lowongan"
                    className="text-[12px] md:text-[13px] font-bold no-underline inline-flex items-center gap-1"
                    style={{ color: "var(--pg-red-600)" }}
                  >
                    Lihat semua <Icon name="arrow_right" size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FITUR 2 — Paspor Perantau Global (visual left, text right) */}
        <section
          className="px-5 md:px-8 py-16 md:py-24"
          style={{
            background:
              "linear-gradient(180deg, #fefbf3 0%, var(--pg-paper) 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto md:grid md:grid-cols-[1fr_1fr] md:gap-14 md:items-center">
            <div className="relative order-2 md:order-1 mt-10 md:mt-0">
              <div
                aria-hidden
                className="absolute -top-10 -left-10 w-72 h-72 rounded-full pointer-events-none -z-10"
                style={{
                  background:
                    "radial-gradient(circle, rgba(201,138,20,0.20), transparent 65%)",
                  filter: "blur(20px)",
                }}
              />
              <div
                className="relative rounded-3xl overflow-hidden text-white"
                style={{
                  background:
                    "linear-gradient(140deg, #c98a14 0%, #8a5e0a 55%, #5e3f06 100%)",
                  boxShadow:
                    "0 24px 56px rgba(138,94,10,0.32), 0 4px 0 rgba(94,63,6,0.18)",
                }}
              >
                <div
                  className="flex items-center justify-between px-6 pt-6 pb-4"
                  style={{ borderBottom: "1px dashed rgba(255,255,255,0.22)" }}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase font-mono">
                      Paspor Perantau Global
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-80">
                    No. PPG/2026/SA-0042
                  </span>
                </div>
                <div className="px-6 py-7">
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase font-mono opacity-80">
                    Sertifikasi Siap Kerja
                  </div>
                  <div className="text-[28px] md:text-[34px] font-extrabold tracking-[-0.025em] leading-[1.05] mt-1">
                    Saudi Arabia
                  </div>
                  <div className="text-[12.5px] mt-3 opacity-90 leading-relaxed">
                    Diberikan kepada{" "}
                    <span className="font-bold">[Nama Kandidat]</span> atas
                    penyelesaian modul psikotes, orientasi negara, dan skill
                    profesi.
                  </div>
                  <div
                    className="grid grid-cols-3 gap-3 mt-5 pt-4"
                    style={{ borderTop: "1px dashed rgba(255,255,255,0.22)" }}
                  >
                    {(
                      [
                        { label: "Psikotes", value: "Lulus" },
                        { label: "Orientasi", value: "Lulus" },
                        { label: "Skill", value: "Lulus" },
                      ] as const
                    ).map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-[8.5px] font-bold tracking-[0.22em] uppercase font-mono opacity-70">
                          {s.label}
                        </span>
                        <span className="text-[13px] font-extrabold mt-0.5">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="flex items-end justify-between px-6 pb-6 pt-3"
                  style={{ borderTop: "1px dashed rgba(255,255,255,0.22)" }}
                >
                  <div className="flex flex-col">
                    <span className="text-[8.5px] font-bold tracking-[0.22em] uppercase font-mono opacity-70">
                      Dikeluarkan oleh
                    </span>
                    <span className="text-[11px] font-bold mt-0.5">
                      PT Daya Talenta Global · P3MI Kemnaker
                    </span>
                  </div>
                  <div className="flex items-end gap-[1.5px]" aria-hidden>
                    {[3, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2].map((w, k) => (
                      <span
                        key={k}
                        style={{
                          display: "inline-block",
                          width: w,
                          height: 22,
                          background: "rgba(255,255,255,0.92)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div
                className="absolute -top-4 -right-3 md:-right-5 z-10 grid place-items-center"
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 999,
                  background: "var(--pg-red-600)",
                  color: "#ffffff",
                  border: "3px dashed rgba(255,255,255,0.55)",
                  transform: "rotate(-10deg)",
                  boxShadow: "0 8px 20px rgba(215,38,47,0.35)",
                }}
              >
                <div className="text-center leading-tight">
                  <div className="text-[8.5px] font-bold tracking-[0.18em] uppercase font-mono">
                    100%
                  </div>
                  <div className="text-[14px] font-extrabold tracking-tight">
                    Gratis
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div
                className="inline-flex items-center gap-2 text-[11px] md:text-[12px] font-bold tracking-[0.22em] uppercase font-mono mb-5 px-3 py-1.5 rounded-full"
                style={{
                  color: "#8a5e0a",
                  background: "rgba(201,138,20,0.12)",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "#c98a14" }}
                />
                Fitur 2 · Paspor Perantau Global
              </div>
              <h2 className="text-[30px] md:text-[48px] font-extrabold tracking-[-0.03em] leading-[1.05]">
                Sertifikasi{" "}
                <span style={{ color: "#8a5e0a" }}>siap kerja</span>, gratis
                dari kami.
              </h2>
              <p className="text-[15px] md:text-[17px] text-pg-ink-700 leading-relaxed mt-5">
                Sebelum berangkat, ambil kursus dan ujian sertifikasi langsung
                di Talent Hub — dari psikotes standar industri, orientasi
                negara tujuan, sampai skill khusus per posisi. Lulus, dapat{" "}
                <span className="font-bold">Paspor Perantau Global</span> yang
                kami tampilkan ke employer.
              </p>
              <ul className="flex flex-col gap-3 mt-7">
                {[
                  {
                    title: "Psikotes standar industri",
                    body: "Test kemampuan kerja, integritas, dan kesiapan mental — sesuai requirement employer luar negeri.",
                  },
                  {
                    title: "Orientasi per negara tujuan",
                    body: "Saudi: budaya kerja & adat. Jepang: etika & hierarki. Taiwan: aturan caregiver. Modul singkat, fokus praktis.",
                  },
                  {
                    title: "Skill khusus per posisi",
                    body: "Perawat → bedside care basics. Driver → defensive driving + bahasa Jepang dasar. Caregiver → eldercare modules.",
                  },
                  {
                    title: "Sertifikat ditampilkan ke employer",
                    body: "Paspor PG kamu otomatis attached ke lamaran. Tanda kamu sudah disiapkan, bukan sembarangan kirim.",
                  },
                ].map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <span
                      className="w-7 h-7 rounded-full grid place-items-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(201,138,20,0.12)",
                        color: "#8a5e0a",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] md:text-[16px] font-bold tracking-tight">
                        {b.title}
                      </span>
                      <span className="text-[13.5px] md:text-[14.5px] text-pg-ink-600 leading-relaxed">
                        {b.body}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div
                className="inline-flex items-center gap-2 mt-8 text-[12px] md:text-[13px] font-semibold font-mono px-3 py-2 rounded-full"
                style={{
                  color: "#5a5a5a",
                  background: "rgba(14,14,14,0.04)",
                  border: "1px dashed rgba(14,14,14,0.12)",
                }}
              >
                <Icon name="clock" size={14} stroke={2.2} />
                Modul perlahan launching · Q3 2026
              </div>
            </div>
          </div>
        </section>

        {/* CARA MULAI */}
        <section className="px-5 md:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-10">
              <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-red-600 font-mono mb-3">
                Cara mulai · 3 langkah
              </div>
              <h2 className="text-[28px] md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                Daftar &amp; mulai apply dalam ~2 menit.
              </h2>
              <p className="text-[15px] md:text-[17px] text-pg-ink-700 leading-relaxed mt-3">
                Daftar pake email + password kamu, verifikasi lewat email, langsung lengkapi profil dan apply lowongan. Semua dari satu akun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex flex-col gap-4 p-5 md:p-7 rounded-3xl bg-pg-paper border border-pg-ink-100"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-full text-white flex items-center justify-center font-extrabold text-base flex-shrink-0"
                      style={{
                        background: s.bg,
                        boxShadow: `0 4px 12px ${s.glow}`,
                      }}
                    >
                      {s.n}
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-pg-ink-100 text-[10px] font-bold tracking-widest uppercase font-mono text-pg-ink-500">
                      {s.eta}
                    </div>
                  </div>
                  <h3 className="text-[20px] md:text-[22px] font-extrabold tracking-[-0.018em] leading-[1.2]">
                    {s.title}
                  </h3>
                  <p className="text-[13.5px] md:text-[14.5px] text-pg-ink-700 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
              <a
                href={APP_URL}
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                style={{
                  background: "var(--pg-red-600)",
                  boxShadow: "0 3px 10px rgba(215,38,47,0.30)",
                }}
              >
                Daftar di Talent Hub <Icon name="arrow_right" size={18} />
              </a>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya mau tanya soal Talent Hub.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                style={{
                  background: "#25D366",
                  boxShadow: "0 3px 10px rgba(37,211,102,0.30)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" />
                </svg>
                Tanya PIC dulu via WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-5 md:px-8 py-14 md:py-20 bg-white border-t border-pg-ink-100">
          <div className="max-w-5xl mx-auto md:grid md:grid-cols-[1fr_1.5fr] md:gap-16">
            <div>
              <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-red-600 font-mono mb-3">
                FAQ Talent Hub
              </div>
              <h2 className="text-[28px] md:text-[44px] font-extrabold tracking-[-0.03em] leading-[1.05]">
                Yang sering ditanya soal akun.
              </h2>
              <p className="text-[15px] md:text-[16px] text-pg-ink-700 leading-relaxed mt-3">
                Soal akun, password, dokumen, dan keamanan data. Kalau masih ada yang ditanya, hubungi PIC kami via WhatsApp.
              </p>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya mau tanya soal Talent Hub.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 mt-5 rounded-2xl text-white font-bold text-sm no-underline"
                style={{
                  background: "#25D366",
                  boxShadow: "0 3px 10px rgba(37,211,102,0.30)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" />
                </svg>
                Tanya via WhatsApp
              </a>
            </div>
            <div className="mt-8 md:mt-0">
              {FAQS.map((item, i) => (
                <details
                  key={i}
                  open={item.open}
                  className={`group py-5 ${i ? "border-t border-pg-ink-100" : "border-t border-pg-ink-100"} ${i === FAQS.length - 1 ? "border-b border-pg-ink-100" : ""}`}
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                    <h3 className="text-base md:text-[17px] font-extrabold text-pg-ink-900 tracking-[-0.012em]">
                      {item.q}
                    </h3>
                    <div
                      className="w-9 h-9 rounded-full grid place-items-center transition-all flex-shrink-0 group-open:bg-pg-ink-900 group-open:text-white"
                      style={{
                        background: "var(--pg-paper)",
                        border: "1px solid var(--pg-border)",
                        color: "var(--pg-ink-secondary)",
                      }}
                    >
                      <Icon
                        name="chevron_down"
                        size={16}
                        stroke={2.5}
                        className="group-open:rotate-180 transition-transform"
                      />
                    </div>
                  </summary>
                  <p className="mt-3 text-[14.5px] md:text-[15px] text-pg-ink-700 leading-relaxed pr-12">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA — Journey hero (wireframe globe, light & cheerful) */}
        <section
          className="relative overflow-hidden isolate"
          style={{ background: "#faf2dc" }}
        >
          {/* Smooth fade-in from previous white FAQ section */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-32 md:h-44 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, rgba(250,242,220,0.7) 60%, rgba(250,242,220,0) 100%)",
            }}
          />
          {/* Background image: natural aspect, pinned to bottom — pure cream above */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 aspect-[16/9] w-full"
          >
            <Image
              src="/images/cta/journey-globe-v4.jpg"
              alt=""
              fill
              className="object-cover object-bottom"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1440px"
              quality={90}
              priority={false}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-20 md:h-28"
              style={{
                background:
                  "linear-gradient(180deg, #faf2dc 0%, rgba(250,242,220,0.6) 60%, rgba(250,242,220,0) 100%)",
              }}
            />
          </div>

          <div className="relative px-5 md:px-8 pt-20 md:pt-24 pb-[58vw] md:pb-[42vw] text-center">
            <div className="max-w-3xl mx-auto">
              <div
                className="inline-flex items-center gap-2 text-[11px] md:text-[12px] font-bold tracking-[0.22em] uppercase font-mono mb-5"
                style={{ color: "var(--pg-red-600)" }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-red-600)" }}
                />
                Siap mulai?
              </div>
              <h2
                className="text-[34px] md:text-[60px] font-extrabold tracking-[-0.035em] leading-[1.04]"
                style={{ color: "#0e0e0e" }}
              >
                Bikin akun Talent Hub,
                <br />
                mulai apply{" "}
                <span
                  style={{
                    color: "var(--pg-red-600)",
                    fontStyle: "italic",
                  }}
                >
                  hari ini
                </span>
                .
              </h2>
              <p
                className="text-[15px] md:text-[18px] leading-relaxed mt-6 max-w-prose mx-auto"
                style={{ color: "#3a3a3a" }}
              >
                Akun gratis, ~2 menit. Lengkapi profil sekali, pakai untuk semua
                lamaran. Status update real-time, PIC dampingi via WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9 max-w-md mx-auto">
                <a
                  href={APP_URL}
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                  style={{
                    background: "var(--pg-red-600)",
                    boxShadow:
                      "0 8px 22px rgba(215,38,47,0.32), 0 0 0 1px rgba(255,255,255,0.10) inset",
                  }}
                >
                  Daftar di Talent Hub <Icon name="arrow_right" size={18} />
                </a>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya mau tanya soal Talent Hub.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 text-base font-bold rounded-2xl no-underline transition-all hover:bg-pg-ink-50"
                  style={{
                    background: "#ffffff",
                    color: "#0e0e0e",
                    border: "1.5px solid #e6dcc1",
                    boxShadow: "0 2px 0 rgba(14,14,14,0.04)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                    aria-hidden
                  >
                    <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" />
                  </svg>
                  Tanya via WhatsApp
                </a>
              </div>
              <div
                className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-10 text-[11px] font-semibold tracking-widest uppercase font-mono"
                style={{ color: "rgba(14,14,14,0.45)" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={12} stroke={2.5} /> Akun gratis
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={12} stroke={2.5} /> Email verifikasi
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={12} stroke={2.5} /> ~2 menit setup
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppFab />
    </>
  );
}
