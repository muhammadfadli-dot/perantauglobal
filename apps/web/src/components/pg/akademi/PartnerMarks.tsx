import Image from "next/image";

/**
 * Lembaga di balik Sertifikat Perantau, berikut peran masing-masing.
 *
 * Isi dan pembagian perannya dikunci Ifa (PO) 30 Juli 2026 bersama kiriman
 * marknya: Lemkasi UI yang melatih, LSP UI yang menguji dan menerbitkan
 * sertifikat. "Lemkasi" adalah singkatan Lembaga Vokasi UI, jadi copy lama yang
 * cuma menyebut Lembaga Vokasi UI bukan salah, cuma belum lengkap.
 *
 * Tiap mark WAJIB tampil bersama label perannya. Logo lembaga tanpa keterangan
 * peran terbaca kandidat sebagai jaminan atas pekerjaannya, bukan atas
 * pelatihannya, dan itu jenis salah baca yang bisa ditagih balik ke kita.
 *
 * Diekstrak dari `/akademi` 4 Agustus 2026 supaya halaman detail program bisa
 * memakai mark yang sama. Ifa melaporkan 3 Agustus bahwa di halaman Sertifikat
 * Perantau Barista logonya belum kelihatan sama sekali, LEMKASI cuma muncul
 * sebagai teks di alur pelatihan. Satu sumber, dua halaman.
 */
export const ACADEMY_PARTNERS = [
  {
    src: "/images/logos/mitra-lemkasi-ui.jpg",
    alt: "Lembaga Vokasi Universitas Indonesia",
    role: "Pelatihan",
    body: "Lemkasi UI menyusun dan menjalankan pelatihan kompetensinya.",
  },
  {
    src: "/images/logos/mitra-lsp-ui.jpg",
    alt: "Lembaga Sertifikasi Profesi Universitas Indonesia",
    role: "Sertifikasi",
    body: "LSP UI yang menguji dan menerbitkan sertifikat kompetensinya.",
  },
] as const;

export function PartnerMarks({ accent = "gold" }: { accent?: "gold" | "amber" }) {
  const roleColor = accent === "amber" ? "var(--pa-amber-700)" : "var(--pg-gold-700)";
  return (
    <div className="grid sm:grid-cols-2 gap-3.5">
      {ACADEMY_PARTNERS.map((p) => (
        <div
          key={p.src}
          className="rounded-2xl bg-white border border-pg-ink-200 p-4 flex flex-col gap-3"
        >
          <div className="relative w-full h-[52px]">
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(min-width: 640px) 360px, 90vw"
              className="object-contain object-left"
            />
          </div>
          <div
            className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: roleColor }}
          >
            {p.role}
          </div>
          <p className="text-[12.5px] leading-relaxed text-pg-ink-500 m-0">{p.body}</p>
        </div>
      ))}
    </div>
  );
}
