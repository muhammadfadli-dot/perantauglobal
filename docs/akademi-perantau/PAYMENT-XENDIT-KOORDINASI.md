# Setup Pembayaran Xendit — Paket Koordinasi (PO ↔ Finance)

> **Untuk:** Product Owner Akademi Perantau · **Tujuan:** dipakai PO untuk koordinasi dengan tim Finance, supaya Finance mengembalikan **semua data yang diperlukan** ke Panji sebelum tim dev menyambungkan pembayaran.
> **Konteks produk:** Paspor Perantau Global – Arab Saudi (produk berbayar **Rp 500.000**). Peserta **membayar di aplikasi saat akan mulai mengambil kursus**; akses kursus + psikotes terbuka setelah lunas.
> **Gateway pembayaran terpilih:** **Xendit**. Disusun 18 Juni 2026.

---

## 0. Gambaran singkat alur uang

```
Peserta daftar Paspor → bayar via Xendit (QRIS / VA / e-wallet / retail)
   → Xendit terima dana → "settle" ke saldo Xendit (T+X per metode)
   → dicairkan ke REKENING PT (jadwal tetap — lihat §B.2)
   → Finance rekonsiliasi (cocokkan pembayaran ↔ peserta ↔ pencairan bank)
```

Tim dev (saya) menyambungkan langkah "bayar via Xendit" + buka akses setelah lunas. **Semua keputusan komersial, legal, pajak, dan rekening = ranah Finance/PO.** Dokumen ini memetakan persis apa yang Finance perlu siapkan & putuskan.

---

## A. Legalitas & Akun Xendit (KYC) — disiapkan Finance/Legal

Xendit butuh verifikasi badan usaha sebelum bisa terima uang sungguhan ("Live Mode"). **Test Mode aktif langsung** tanpa dokumen (dev bisa mulai integrasi sambil menunggu). Verifikasi KYC biasanya **1–3 hari kerja** setelah dokumen lengkap.

**Keputusan #1 — Entitas merchant:** akun Xendit didaftarkan atas nama **badan usaha mana?** (kemungkinan **PT Daya Talenta Global** sebagai penjual produk & penerima dana). Ini menentukan dokumen di bawah + rekening pencairan. → *Finance konfirmasi.*

**Dokumen wajib untuk badan usaha PT (sumber: Xendit Help Center):**

| # | Dokumen | Catatan |
|---|---------|---------|
| 1 | **KTP** pemilik/direktur (penandatangan) | Nama harus sama dengan Akta |
| 2 | **NPWP** pemilik/direktur | — |
| 3 | **NPWP perusahaan** | Nama harus sama dengan nama legal di Xendit |
| 4 | **NIB** (Nomor Induk Berusaha) | Bisa diganti **SIUP + TDP** kalau belum ada NIB |
| 5 | **Akta Pengangkatan Direktur Terakhir** | Kalau PT baru & belum ada perubahan: pakai **Akta Pendirian + SK Menkumham Pendirian** |
| 6 | **SK Menkumham** atas Akta tersebut | Tanggal terbit ≤ 5 tahun, semua halaman, format PDF |
| 7 | **Izin usaha lain** sesuai aktivitas bisnis (jika ada) | — |
| 8 | **Proof of business** = halaman produk yang LIVE & bisa diakses | Xendit minta bukti produk dijual online (lihat catatan ⚠️ di bawah) |

⚠️ **Catatan "proof of business":** Xendit ingin melihat halaman produk yang live (bisa di-checkout). Produk Paspor **belum di-deploy**. Opsi: (a) pakai halaman `perantauglobal.com/akademi` yang sudah ada sebagai bukti, atau (b) selesaikan dulu landing page produk. Dev bisa siapkan halaman ini paralel — **Finance/PO tandai mana yang dipakai.**

**Keputusan #2 — Siapa pemegang akun & dashboard Xendit?** (email akun, siapa yang pegang API key, siapa admin Finance yang akses laporan). → *Finance tunjuk PIC.*

---

## B. Keuangan, Settlement & Pajak — diputuskan Finance

### B.1 Rekening pencairan (settlement)
Rekening bank **atas nama PT** (entitas yang sama dengan akun Xendit) untuk menerima dana. → *Finance siapkan: nama bank, no. rekening, atas nama.*

### B.2 Jadwal pencairan & rekonsiliasi — "submit hari kelima"
- **Settlement default Xendit** masuk ke saldo Xendit per metode: VA instan (BCA T+2), QRIS/e-wallet ±T+1–T+2, **retail (Alfamart/Indomaret) T+5**, semua di **hari kerja**.
- **Preferensi Panji:** pencairan ke rekening PT + rekonsiliasi dilakukan pada **jadwal TETAP (mis. tiap tanggal 5 / hari ke-5)**, **bukan per-transaksi**. → Xendit mendukung lewat **Auto-Withdrawal terjadwal** + **Scheduled Reports** (laporan otomatis dikirim rutin).
- → *Finance konfirmasi:* (a) tanggal/hari pencairan tetap yang diinginkan, (b) frekuensi (mingguan / bulanan), (c) butuh "Early Settlement" (instan, ada biaya) atau cukup standar.
- ⚠️ **Akun baru** kadang kena pembatasan settlement sementara (hingga ±2 bulan pertama atau 60 transaksi pertama) — Finance tanyakan ke Account Manager Xendit (lihat §D).

### B.3 Metode pembayaran yang diaktifkan
Pilih yang relevan untuk audiens (calon PMI, banyak yang belum punya rekening/m-banking):
- **QRIS** (paling universal) · **Virtual Account** (BCA/BNI/Mandiri/BRI) · **e-wallet** (DANA/OVO/ShopeePay/GoPay) · **Retail** (Alfamart/Indomaret — penting buat yang unbanked).
→ *Finance/PO tandai metode mana yang diaktifkan.*

### B.4 Biaya transaksi (fee) — siapa menanggung?
Xendit memungut fee per transaksi (beda per metode; QRIS, VA, e-wallet, retail tarifnya beda). **Keputusan:** fee **diserap perusahaan** (harga peserta tetap Rp 500.000) **atau dibebankan ke peserta** (peserta bayar Rp 500.000 + fee)?
→ **Rekomendasi:** diserap perusahaan, harga tetap bulat Rp 500.000 (lebih sederhana & ramah audiens). *Finance putuskan + minta tarif fee final ke Xendit.*

### B.5 Pajak
- **PPN:** apakah harga Rp 500.000 **sudah termasuk PPN** atau belum? Apakah jasa pelatihan/sertifikasi ini kena PPN atau dapat fasilitas? → *Finance tentukan (perlakuan pajak jasa pendidikan/pelatihan).*
- **Faktur/e-faktur:** apakah perlu menerbitkan faktur pajak ke peserta? Format kuitansi/invoice apa? → *Finance tentukan.*

### B.6 Pengakuan pendapatan & pencatatan
- Pendapatan diakui **saat pembayaran lunas** (sebelum kursus dimulai) — konfirmasi sesuai kebijakan akuntansi.
- **PIC rekonsiliasi** dari Finance siapa? Format laporan yang diinginkan (Transaction Report / Balance Report / Auto-Withdrawal Report dari Xendit)?

### B.7 Kebijakan refund
Produk digital + psikotes external. Perlu **SOP refund**: kapan boleh refund (mis. sebelum mengakses kursus / sebelum link psikotes dikirim), kapan tidak, **siapa yang menyetujui** refund. → *Finance + PO susun kebijakan singkat.*

---

## C. Teknis — tim dev (saya), dikerjakan SETELAH A & B beres

Hanya butuh 2 hal dari Finance/PO untuk mulai menyambungkan (saya tidak pernah memegang raw key):
1. **`XENDIT_SECRET_KEY`** (mulai dari Test Key) + **`XENDIT_WEBHOOK_TOKEN`** — di-set PO/Finance ke environment Vercel (Production + Preview).
2. Konfirmasi metode bayar & jadwal settlement (dari §B).

Yang saya bangun: migrasi `payment_status` di enrollment · buat invoice Xendit saat daftar · webhook penanda "lunas" · kunci akses kursus sampai lunas · tombol admin "Tandai lunas" (fallback manual). Detail di `PASPOR-ARAB-PRODUCT-PLAN.md` §3d–§5.

---

## D. Pertanyaan untuk Account Manager / CS Xendit (ditanyakan PO/Finance)

1. **Tarif fee final** per metode (QRIS, VA, e-wallet, retail) untuk volume kami — bisa dinegosiasi?
2. **Jadwal settlement / Auto-Withdrawal terjadwal** — bisa diatur ke tanggal/hari tetap (mis. tgl 5)? Cara setupnya?
3. **Pembatasan settlement akun baru** — apakah berlaku untuk PT kami? Berapa lama, dan cara mempercepat?
4. **Instant Activation** — bisa terima pembayaran lebih cepat sambil KYC jalan? Batasannya apa?
5. **Faktur pajak / dokumen** — Xendit menyediakan dukungan apa untuk kebutuhan pajak Indonesia?
6. **Refund** — alur & batas waktu refund per metode.

---

## E. ⬇️ FORM DATA — diisi Finance, dikirim balik ke Panji

> Ini inti yang Panji butuh kembali **lengkap**. PO minta Finance isi tabel ini.

**1. Entitas & Akun**
- [ ] Entitas merchant (nama PT lengkap): __________
- [ ] NPWP perusahaan: __________
- [ ] PIC pemegang akun Xendit (nama + email): __________
- [ ] Direktur penandatangan (nama, sesuai Akta): __________

**2. Dokumen KYC (lampirkan file PDF)**
- [ ] KTP direktur  · [ ] NPWP direktur  · [ ] NPWP perusahaan
- [ ] NIB (atau SIUP + TDP)
- [ ] Akta (Pengangkatan Direktur Terakhir / Pendirian) + SK Menkumham
- [ ] Izin usaha lain (jika ada)
- [ ] Halaman "proof of business" yang dipakai (URL): __________

**3. Rekening Pencairan**
- [ ] Bank: __________ · No. rek: __________ · Atas nama: __________

**4. Settlement & Rekonsiliasi**
- [ ] Jadwal pencairan tetap diinginkan (tanggal/hari): __________
- [ ] Frekuensi: ☐ Mingguan ☐ Bulanan ☐ Lainnya: ____
- [ ] Perlu Early Settlement (instan, berbiaya)? ☐ Ya ☐ Tidak
- [ ] PIC rekonsiliasi Finance: __________

**5. Metode Pembayaran yang diaktifkan**
- [ ] QRIS  [ ] Virtual Account (bank: ____)  [ ] e-wallet (____)  [ ] Retail (Alfamart/Indomaret)

**6. Biaya, Harga, Pajak**
- [ ] Fee Xendit ditanggung: ☐ Perusahaan (harga tetap Rp500rb) ☐ Peserta (+fee)
- [ ] Harga Rp 500.000: ☐ sudah termasuk PPN ☐ belum / ☐ bebas PPN
- [ ] Perlu terbitkan faktur/kuitansi ke peserta? ☐ Ya (format: ____) ☐ Tidak

**7. Refund**
- [ ] Kebijakan refund (kapan boleh / tidak): __________
- [ ] Penyetuju refund: __________

**8. Kunci teknis (setelah akun jadi)**
- [ ] `XENDIT_SECRET_KEY` (test) sudah di-set ke env? ☐ · siapa: ____
- [ ] `XENDIT_WEBHOOK_TOKEN` sudah di-set? ☐

---

## F. Alur koordinasi & urutan

1. **PO** baca dokumen ini → kirim **§D (pertanyaan)** + **§E (form)** ke Finance.
2. **Finance** lengkapi dokumen KYC (§A) + isi form (§E) + tanya Xendit (§D).
3. **Finance/PO** daftar akun Xendit, submit KYC (1–3 hari kerja), set rekening + jadwal settlement.
4. **Finance/PO** kirim balik ke **Panji**: form §E terisi + konfirmasi akun aktif + key sudah di-set.
5. **Panji → dev (saya):** mulai integrasi (Test Mode dulu, lalu Live setelah KYC approve).

**Estimasi jalur kritis:** kumpulkan dokumen (tergantung Finance) → KYC Xendit 1–3 hari kerja → integrasi dev. Test Mode bisa jalan paralel sejak hari ini.

---

## Lampiran — file terkait
- `PASPOR-ARAB-PRODUCT-PLAN.md` — arsitektur produk + gap teknis payment (§3d, §4, §5)
- `Paspor-Arab-Saudi-Ringkasan-Kurikulum.pdf` — ringkasan produk (untuk konteks Finance)
