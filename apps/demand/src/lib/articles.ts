export type Article = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  cover: string;
  body: { heading?: string; text: string }[];
};

export const articles: Article[] = [
  {
    slug: "memahami-langkah-awal-menuju-karier-global",
    category: "Career Guide",
    title: "Memahami Langkah Awal Menuju Karier Global",
    excerpt: "Sebelum memilih peluang kerja di luar negeri, kandidat perlu memahami arah karier, kebutuhan persiapan, dan sumber informasi yang dapat dipercaya.",
    date: "28 August 2026",
    readTime: "4 min read",
    cover: "/images/sector-wellness.jpg",
    body: [
      { text: "Karier global dimulai dari keputusan yang terinformasi. Menyusun arah, memahami peran, dan menyiapkan dokumen sejak awal membantu setiap langkah terasa lebih jelas." },
      { heading: "Mulai dari tujuan", text: "Kenali bidang kerja, negara tujuan, dan kemampuan yang ingin dikembangkan sebelum memilih jalur persiapan." },
      { heading: "Siapkan informasi yang tepat", text: "Gunakan sumber yang jelas untuk memahami proses, kualifikasi, dan dukungan yang tersedia pada setiap tahap." },
    ],
  },
  {
    slug: "memulai-karier-global-dengan-persiapan-yang-tepat",
    category: "Career Readiness",
    title: "Memulai Karier Global dengan Persiapan yang Tepat",
    excerpt: "Peluang kerja di luar negeri dimulai jauh sebelum wawancara. Kenali persiapan yang membantu kandidat bergerak dengan lebih percaya diri.",
    date: "20 August 2026",
    readTime: "5 min read",
    cover: "/images/hero-arches.jpg",
    body: [
      { text: "Bekerja di luar negeri bukan hanya soal menemukan lowongan. Ini adalah keputusan karier yang membutuhkan informasi yang jelas, kesiapan keterampilan, dan proses yang dapat dipercaya." },
      { heading: "Mulai dari arah yang jelas", text: "Setiap kandidat perlu memahami peran, negara tujuan, kualifikasi, dan tahapan proses sebelum mengirim lamaran. Informasi yang terbuka membantu setiap langkah terasa lebih terukur." },
      { heading: "Kesiapan adalah investasi", text: "Bahasa, keterampilan teknis, dokumen, dan cara berkomunikasi saat seleksi adalah bagian dari kesiapan. Bukan sekadar syarat, tetapi bekal untuk memulai perjalanan kerja dengan baik." },
      { heading: "Pilih proses yang transparan", text: "Kandidat perlu dapat menanyakan status, memahami biaya yang mungkin muncul setelah offering, dan mengetahui siapa PIC yang mendampingi mereka. Transparansi adalah fondasi kepercayaan." },
    ],
  },
  {
    slug: "mengapa-employer-global-membutuhkan-partner-talenta",
    category: "Employer Perspective",
    title: "Mengapa Employer Global Membutuhkan Partner Talenta yang Tepat",
    excerpt: "Rekrutmen lintas negara yang baik bukan hanya tentang mengisi posisi. Ia menyatukan kebutuhan bisnis, kesiapan kandidat, dan keberlanjutan hubungan kerja.",
    date: "14 August 2026",
    readTime: "4 min read",
    cover: "/images/sector-hospitality.jpg",
    body: [
      { text: "Ketika sebuah organisasi merekrut talenta lintas negara, kejelasan proses menjadi sama pentingnya dengan kualitas kandidat." },
      { heading: "Menyatukan kebutuhan dan kesiapan", text: "Partner yang tepat menerjemahkan kebutuhan peran menjadi proses sourcing, screening, dan persiapan yang relevan. Hasilnya adalah proses yang lebih fokus untuk employer dan kandidat." },
      { heading: "Membangun awal yang lebih baik", text: "Perjalanan tidak berhenti setelah kandidat dipilih. Dukungan dokumentasi, komunikasi, dan kesiapan keberangkatan membantu menciptakan fondasi kerja yang lebih kuat." },
    ],
  },
  {
    slug: "belajar-dari-cerita-perantau-global",
    category: "Talent Stories",
    title: "Belajar dari Cerita Perantau Global",
    excerpt: "Di balik setiap penempatan ada proses belajar, persiapan, dan keberanian untuk melangkah. Cerita kandidat membantu calon perantau melihat perjalanan dengan lebih realistis.",
    date: "5 August 2026",
    readTime: "3 min read",
    cover: "/images/sector-healthcare.jpg",
    body: [
      { text: "Cerita dari kandidat yang sudah menjalani proses adalah sumber pembelajaran yang berharga bagi orang yang sedang mempertimbangkan langkah yang sama." },
      { heading: "Bukan jalan pintas", text: "Setiap perjalanan memiliki ritmenya sendiri. Kandidat perlu melalui persiapan, seleksi, dan penyesuaian yang berbeda sesuai peran dan negara tujuan." },
      { heading: "Keberanian yang terinformasi", text: "Informasi yang baik tidak menjanjikan jalan yang selalu mudah. Ia membantu seseorang mengambil keputusan dengan lebih sadar, siap, dan percaya diri." },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
