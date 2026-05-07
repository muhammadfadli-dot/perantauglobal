/**
 * Detailed copy per position — sourced from FEEDBACK LANDING PAGE PDF (2026-04-23).
 *
 * Copy guidelines (mandatory):
 * - NO claims of "tanpa biaya kandidat" — use "bebas biaya sebelum offering letter"
 * - NO mentions of free language training — DTG doesn't provide it
 * - NO fake testimonials, NO fake slot counts
 * - Use general country names (Saudi Arabia) not specific cities unless confirmed
 * - Salary "diterima setiap bulan", not "tanggal X"
 * - NO WhatsApp mention anywhere
 */

import type { IconName } from "@/components/pg/Icon";

export type DetailRow = { label: string; value: string };

export type Benefit = { icon: IconName; label: string; value: string };

export type PositionDetail = {
  /** Detail tabel */
  details: DetailRow[];
  /** Benefit cards */
  benefits: Benefit[];
  /** Bullet list kualifikasi */
  qualifications: string[];
  /** Biaya keberangkatan */
  fee?: {
    amount: string;
    breakdown: string[];
    note?: string;
  };
  /** Process steps — generic 5-step (no fake training claims) */
  process?: string[];
  /** Public job description */
  jobDescription?: string[];
};

const COMMON_PROCESS = [
  "Daftar",
  "Seleksi awal",
  "Wawancara",
  "Dokumen & medical",
  "Berangkat",
];

const COMMON_FEE_NOTE =
  "Gratis sampai kamu terima offering letter. Biaya baru muncul setelah employer menerima kamu.";

export const POSITION_DETAILS: Record<string, PositionDetail> = {
  // === Saudi Arabia ===
  "perawat-saudi-arabia": {
    details: [
      { label: "Lokasi", value: "Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Hari libur", value: "Sesuai hukum Arab Saudi" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 3.200 / bulan" },
      { icon: "bowl", label: "Uang makan", value: "SAR 200 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
      { icon: "stethoscope", label: "Fasilitas medis", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Wanita, 21–38 tahun",
      "Minimal D3 Keperawatan",
      "STR (Surat Tanda Registrasi) aktif",
      "Minimal 1 tahun pengalaman setelah STR terbit",
      "Mampu berkomunikasi bahasa Inggris",
    ],
    fee: {
      amount: "Rp 20.000.000",
      breakdown: ["MCU GAMCA", "Apostille", "QVP", "Enjaz", "Psikotes", "Dataflow", "Mumaris"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "barista-saudi-arabia": {
    jobDescription: [
      "Menyiapkan dan meracik berbagai jenis minuman",
      "Melayani pelanggan dengan ramah dan informatif",
      "Mengelola pesanan dengan rapi dan tepat",
      "Menjaga kebersihan area kerja serta peralatan",
    ],
    details: [
      { label: "Lokasi", value: "Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 1.500 / bulan" },
      { icon: "bowl", label: "Uang makan", value: "SAR 300 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Laki-laki / wanita, 21–30 tahun",
      "Mampu berkomunikasi bahasa Inggris",
      "Pengalaman barista / keahlian kopi (preferred)",
    ],
    fee: {
      amount: "Rp 8.000.000",
      breakdown: ["Pra MCU", "MCU GAMCA", "Apostille", "Ujian QVP", "Enjaz", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "waiter-saudi-arabia": {
    jobDescription: [
      "Menyambut pelanggan dan menyajikan menu dengan sopan",
      "Mencatat pesanan makanan dan minuman secara akurat",
      "Memberikan pelayanan pelanggan yang profesional dan responsif",
    ],
    details: [
      { label: "Lokasi", value: "Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 1.500 / bulan" },
      { icon: "bowl", label: "Uang makan", value: "SAR 300 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Laki-laki, 21–30 tahun",
      "Mampu berkomunikasi bahasa Inggris",
    ],
    fee: {
      amount: "Rp 8.000.000",
      breakdown: ["Pra MCU", "MCU GAMCA", "Apostille", "Ujian QVP", "Enjaz", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "waitress-saudi-arabia": {
    jobDescription: [
      "Membantu pelanggan untuk menemukan mejanya",
      "Menyajikan menu dan makanan",
      "Menjaga kelancaran operasional untuk pelanggan yang datang dan pergi",
    ],
    details: [
      { label: "Lokasi", value: "Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 1.600 / bulan" },
      { icon: "bowl", label: "Uang makan", value: "Disediakan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Wanita, 21–35 tahun",
      "Mampu berkomunikasi bahasa Inggris",
    ],
    fee: {
      amount: "Rp 8.000.000",
      breakdown: ["Pra MCU", "MCU GAMCA", "Apostille", "Ujian QVP", "Enjaz", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "chef-bakery-saudi-arabia": {
    details: [
      { label: "Lokasi", value: "Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 2.000 / bulan" },
      { icon: "bowl", label: "Uang makan", value: "Disediakan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Laki-laki, 21–35 tahun",
      "Mampu berkomunikasi bahasa Inggris",
      "Pengalaman bakery / pastry (preferred)",
    ],
    fee: {
      amount: "Rp ?.000.000",
      breakdown: ["MCU GAMCA", "Apostille", "Ujian QVP", "Enjaz", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "head-barista-saudi-arabia": {
    jobDescription: [
      "Menciptakan dan menghidangkan menu minuman baru bersama Barista/Bartender lain",
      "Menjamin kualitas minuman yang dihidangkan",
      "Bertanggung jawab atas inventory bahan baku minuman",
      "Melayani pelanggan dengan ramah dan informatif",
      "Mengelola pesanan dengan rapi dan tepat",
      "Menjaga kebersihan area kerja serta peralatan",
    ],
    details: [
      { label: "Penempatan kerja", value: "30WET (wet30s)" },
      { label: "Lokasi", value: "Muhayil Asir, Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Hari libur", value: "Sesuai hukum Arab Saudi" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Total gaji", value: "SAR 2.200 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Laki-laki, 21–30 tahun",
      "Mampu berkomunikasi bahasa Inggris",
      "Minimal 1 tahun pengalaman sebagai head barista / barista",
    ],
    fee: {
      amount: "Termasuk dokumentasi",
      breakdown: ["Pra MCU", "MCU GAMCA", "Apostille", "Visa", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "roaster-saudi-arabia": {
    jobDescription: [
      "Melakukan proses roasting kopi sesuai standar (atur suhu, waktu, dan profil roasting)",
      "Menjaga kualitas rasa melalui pengecekan dan cupping (tes rasa)",
      "Mengoperasikan & merawat mesin roasting agar tetap optimal",
      "Mencatat dan menganalisa data roasting untuk konsistensi hasil",
      "Mengelola stok biji kopi (green bean & roasted bean) serta proses produksi",
    ],
    details: [
      { label: "Penempatan kerja", value: "30WET (wet30s)" },
      { label: "Lokasi", value: "Muhayil Asir, Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Hari libur", value: "Sesuai hukum Arab Saudi" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Total gaji", value: "Mulai dari SAR 2.800 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
      { icon: "stethoscope", label: "Fasilitas medis", value: "Disediakan oleh perusahaan" },
      { icon: "clock", label: "Uang lembur", value: "Sesuai hukum Arab Saudi" },
    ],
    qualifications: [
      "Laki-laki, 21–30 tahun",
      "Mampu berkomunikasi bahasa Inggris",
      "Minimal 1 tahun pengalaman coffee roasting",
    ],
    fee: {
      amount: "Termasuk dokumentasi",
      breakdown: ["Pra MCU", "MCU GAMCA", "Apostille", "Enjaz", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "chef-pastry-saudi-arabia": {
    jobDescription: [
      "Membuat dan menyiapkan produk pastry & dessert sesuai standar resep",
      "Menjaga kualitas dan konsistensi produk",
      "Mengembangkan menu & resep baru menyesuaikan tren, konsep brand, dan preferensi pasar (termasuk market Timur Tengah)",
      "Mengelola operasional dapur pastry",
      "Memastikan kebersihan & standar food safety",
    ],
    details: [
      { label: "Penempatan kerja", value: "30WET (wet30s)" },
      { label: "Lokasi", value: "Muhayil Asir, Saudi Arabia" },
      { label: "Jam kerja", value: "8 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Hari libur", value: "Sesuai hukum Arab Saudi" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Total gaji", value: "Mulai dari SAR 2.500 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
      { icon: "stethoscope", label: "Fasilitas medis", value: "Disediakan oleh perusahaan" },
      { icon: "clock", label: "Uang lembur", value: "Sesuai hukum Arab Saudi" },
    ],
    qualifications: [
      "Laki-laki, 21–30 tahun",
      "Mampu berkomunikasi bahasa Inggris",
      "Minimal 1 tahun pengalaman pastry / dessert",
    ],
    fee: {
      amount: "Termasuk dokumentasi",
      breakdown: ["Pra MCU", "MCU GAMCA", "Apostille", "Enjaz", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "spa-therapist-saudi-arabia": {
    details: [
      { label: "Penempatan kerja", value: "Dany Salon" },
      { label: "Lokasi", value: "Saudi Arabia" },
      { label: "Jam kerja", value: "10 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 1.500 / bulan" },
      { icon: "bowl", label: "Uang makan", value: "SAR 300 / bulan" },
      { icon: "sparkle", label: "Bonus", value: "2% dari invoice" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Wanita, 28–40 tahun",
      "Minimal 1 tahun pengalaman sebagai Spa Therapist",
      "Bisa berkomunikasi bahasa Inggris",
    ],
    fee: {
      amount: "Rp 4.000.000",
      breakdown: ["Pra MCU", "MCU GAMCA", "Apostille", "Ujian QVP", "Enjaz", "Psikotes"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "laundry-worker-saudi-arabia": {
    jobDescription: [
      "Menyortir laundry",
      "Mengoperasikan mesin cuci dan mesin pengering baju",
      "Menyetrika dan melipat baju",
    ],
    details: [
      { label: "Lokasi", value: "Saudi Arabia" },
      { label: "Jam kerja", value: "9 jam/hari · 6 hari/minggu" },
      { label: "Istirahat", value: "1 hari/minggu" },
      { label: "Annual leave", value: "21 hari" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
      { label: "Masa percobaan", value: "90 hari" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 1.500 / bulan" },
      { icon: "bowl", label: "Uang makan", value: "SAR 300 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Wanita, 23–33 tahun",
      "Bahasa Inggris dasar",
    ],
    process: COMMON_PROCESS,
  },

  "heavy-diesel-mechanic-saudi-arabia": {
    jobDescription: [
      "Troubleshooting dan perbaikan mesin truk diesel berat",
      "Perawatan preventif armada",
      "Penggunaan alat diagnostik mesin",
      "Pemecahan masalah mekanis & engine",
      "Manajemen waktu pengerjaan workshop",
    ],
    details: [
      { label: "Lokasi", value: "Provinsi Timur Saudi Arabia (Dammam, Khobar, Dhahran)" },
      { label: "Jam kerja", value: "8–10 jam/hari" },
      { label: "Hari libur", value: "Sesuai hukum Arab Saudi" },
      { label: "Status kepegawaian", value: "Kontrak 2 tahun" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "SAR 3.500–4.000 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
      { icon: "home", label: "Akomodasi", value: "Disediakan oleh perusahaan" },
      { icon: "truck", label: "Transportasi", value: "Disediakan oleh perusahaan" },
    ],
    qualifications: [
      "Laki-laki, 25–37 tahun",
      "Pengalaman minimal 5 tahun di perawatan & perbaikan truk diesel berat",
      "Mampu mendiagnosis masalah mekanis dan mesin",
      "Familiar dengan engine CAT atau alat berat sejenis",
      "Mampu berkomunikasi bahasa Inggris",
      "Sehat secara fisik & mampu bekerja di lingkungan menuntut",
    ],
    fee: {
      amount: "Rp 10.250.000",
      breakdown: [
        "ID CPMI",
        "BPJS PRA & PURNA",
        "Psikotes",
        "MCU GAMCA",
        "Enjaz Visa",
        "Dokumen Terjemah",
        "Apostille SKCK & Ijazah",
        "QVP",
      ],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  // === Jepang ===
  "truck-driver-jepang": {
    jobDescription: ["Mengendarai kendaraan truk"],
    details: [
      { label: "Lokasi", value: "Jepang" },
      { label: "Jenis pekerjaan", value: "Truck Driver" },
      { label: "Komitmen", value: "Bersedia bekerja di Jepang minimal 5 tahun" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "¥250.000 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
    ],
    qualifications: [
      "Laki-laki, maksimal 44 tahun",
      "Minimal SMA / SMK / sederajat",
      "Pengalaman menyetir di Indonesia minimal 2 tahun",
      "Sertifikasi bahasa: JLPT N4 / JFT A2",
      "SIM A atau SIM B yang masa terbitnya sudah lebih dari 1 tahun",
      "SSW Truck Driver (opsional, kalau punya akan lebih baik)",
    ],
    fee: {
      amount: "Rp ??.000.000",
      breakdown: ["E-KTKLN", "BPJS", "MCU", "COE", "Visa", "Tiket pesawat"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "food-service-jepang": {
    jobDescription: ["Memasak di dapur restoran"],
    details: [
      { label: "Lokasi", value: "Jepang" },
      { label: "Jenis pekerjaan", value: "Food Service (Restoran)" },
      { label: "Informasi tambahan", value: "Bersedia mencicipi makanan non halal" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "¥1.226 / jam" },
      { icon: "shield", label: "Asuransi sosial", value: "Disediakan" },
      { icon: "sparkle", label: "Tunjangan", value: "Sesuai hukum Jepang" },
    ],
    qualifications: [
      "Laki-laki / wanita, maksimal 35 tahun",
      "Minimal SMA / SMK / sederajat",
      "Sertifikasi bahasa: JFT A2 / JLPT N4",
      "Sertifikat keahlian: SSW Restoran",
      "Pengalaman memasak lebih diutamakan",
    ],
    fee: {
      amount: "Rp ??.000.000",
      breakdown: ["E-KTKLN", "BPJS", "MCU", "COE", "Visa SSW", "Tiket pesawat"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  "kaigo-jepang": {
    jobDescription: ["Pekerjaan caregiver umum. Bantuan umum untuk kehidupan sehari-hari."],
    details: [
      { label: "Penempatan", value: "Panti Lansia" },
      { label: "Lokasi", value: "Jepang" },
      { label: "Jam kerja", value: "7,5 jam/hari · 20 hari/bulan" },
    ],
    benefits: [
      { icon: "wallet", label: "Take home pay", value: "¥190.000 / bulan" },
      { icon: "shield", label: "Asuransi", value: "Disediakan" },
    ],
    qualifications: [
      "Wanita, 18–35 tahun",
      "Minimal D3 Keperawatan (jika bukan jurusan Keperawatan, dipersilakan melamar)",
      "Sertifikasi bahasa: JLPT N4 atau setara JFT A2",
      "Sertifikat keahlian: SSW Kaigo (Caregiver)",
    ],
    process: COMMON_PROCESS,
  },

  "pengolahan-makanan-jepang": {
    jobDescription: [
      "Pencairan (defrost) seafood, pembentukan, pemotongan, penimbangan, pengemasan, pemeriksaan, dan persiapan pengiriman",
      "Pengolahan topping untuk gunkan (sushi), pencampuran, pengisian, dan pengemasan",
      "Pengoperasian mesin pada lini produksi, pembersihan tempat kerja, dan pencucian peralatan",
      "Tidak menangani daging babi",
    ],
    details: [
      { label: "Lokasi", value: "Jepang" },
      { label: "Jam kerja", value: "8 jam shift · rata-rata 40 jam/minggu" },
      { label: "Hari libur", value: "8 hari/bulan" },
      { label: "Informasi tambahan", value: "Terbiasa hou-ren-sou (laporan, komunikasi, konsultasi)" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "¥210.000 / bulan" },
    ],
    qualifications: [
      "Wanita, 20–35 tahun",
      "Kewarganegaraan Indonesia",
      "Minimal SMA / SMK / sederajat",
      "Sertifikasi bahasa: JLPT N4 / JFT A2",
      "Sertifikat keahlian: SSW Pengolahan Makanan",
    ],
    fee: {
      amount: "Rp ??.000.000",
      breakdown: ["BPJS", "MCU", "COE", "Visa", "Tiket pesawat"],
      note: COMMON_FEE_NOTE,
    },
    process: COMMON_PROCESS,
  },

  // === Taiwan ===
  "caregiver-taiwan": {
    jobDescription: [
      "Merawat orang sakit / lansia",
      "Mencuci pakaian termasuk menjemur dan melipat",
      "Mengepel lantai",
      "Membersihkan kamar pasien",
      "Menjaga kebersihan lingkungan",
      "Membantu pasien mandi, ganti pakaian, memberi makanan, menemani berjalan, membantu aktivitas rehabilitasi",
    ],
    details: [
      { label: "Lokasi", value: "Taiwan" },
      { label: "Jam kerja", value: "10 jam/hari" },
      { label: "Waktu makan", value: "3x" },
      { label: "Lembur", value: "2 jam/hari" },
      { label: "Hari libur", value: "1 hari/minggu" },
      { label: "Status kepegawaian", value: "Kontrak 3 tahun" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji kotor", value: "NT$ 29.500 / bulan" },
      { icon: "home", label: "Akomodasi", value: "Potong gaji NT$ 2.500 / bulan" },
    ],
    qualifications: [
      "Wanita, 20–40 tahun",
      "Tinggi badan 155 cm ke atas",
      "Berat badan 55 kg ke atas",
      "Memiliki ijazah atau sertifikat pelatihan yang relevan",
      "Minimal 1 tahun dalam perawatan pasien",
    ],
    process: COMMON_PROCESS,
  },

  // === Indonesia ===
  "spg-indonesia": {
    details: [
      { label: "Lokasi", value: "Indonesia (multi-kota)" },
      { label: "Status", value: "Penempatan domestic" },
    ],
    benefits: [
      { icon: "wallet", label: "Gaji pokok", value: "Sesuai brand & kota" },
      { icon: "globe", label: "Lokasi kerja", value: "Beragam — Jakarta, Surabaya, Bandung, dll" },
    ],
    qualifications: [
      "Wanita",
      "Penampilan menarik dan komunikatif",
      "Minimal SMA / SMK / sederajat",
    ],
    process: COMMON_PROCESS,
  },
};

export function getPositionDetail(slug: string): PositionDetail | undefined {
  return POSITION_DETAILS[slug];
}
